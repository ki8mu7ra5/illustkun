import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/app/lib/admin-auth";
import {
  classifyImageWithClaude,
  fallbackClassification,
} from "@/app/lib/classify-image";
import {
  getTitleFromFilename,
  removeWhiteBackground,
} from "@/app/lib/remove-white-background";
import { adminSupabase } from "@/app/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authError = assertAdminRequest(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file は必須です" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "画像ファイルのみアップロードできます" },
        { status: 400 },
      );
    }

    const title = getTitleFromFilename(file.name);
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const pngBuffer = await removeWhiteBackground(inputBuffer);
    const base64Image = pngBuffer.toString("base64");

    const fileName = `${Date.now()}.png`;
    const { error: uploadError } = await adminSupabase.storage
      .from("illustrations")
      .upload(fileName, pngBuffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl: imageUrl },
    } = adminSupabase.storage.from("illustrations").getPublicUrl(fileName);

    let classification;
    try {
      classification = await classifyImageWithClaude(base64Image);
    } catch (classifyError) {
      console.error("Claude classification error:", classifyError);
      classification = fallbackClassification(title, title);
    }

    const { data, error } = await adminSupabase
      .from("illustrations")
      .insert([
        {
          title,
          image_url: imageUrl,
          action: classification.action,
          subject: classification.sub_genre,
          genre: classification.genre,
          sub_genre: classification.sub_genre,
          tags: classification.tags,
          description: classification.description,
          approved: true,
        },
      ])
      .select();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin upload error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
