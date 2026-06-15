import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  classifyImageWithClaude,
  fallbackClassification,
} from "@/app/lib/classify-image";
import { adminSupabase } from "@/app/lib/supabase-admin";

type GenerateRequestBody = {
  action?: string;
  subject?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const action = body.action?.trim();
    const subject = body.subject?.trim();

    if (!action || !subject) {
      return NextResponse.json(
        { error: "action と subject は必須です" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY が設定されていません。.env.local を保存したあと、npm run dev を再起動してください。",
        },
        { status: 500 },
      );
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `${action} ${subject}, flat cartoon illustration, simple cute style, transparent background, soft pastel colors, thick outline, no shadow, icon style`;

    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      background: "transparent",
      output_format: "png",
      size: "1024x1024",
    });

    const b64 = imageResponse.data?.[0]?.b64_json;
    if (!b64) {
      return NextResponse.json(
        { error: "画像の生成に失敗しました（OpenAIから画像データが返りませんでした）" },
        { status: 500 },
      );
    }

    let classification;
    try {
      classification = await classifyImageWithClaude(b64);
    } catch (classifyError) {
      console.error("Claude classification error:", classifyError);
      classification = fallbackClassification(action, subject);
    }

    const title = `${action} ${subject}`;
    const fileName = `${Date.now()}-${action}-${subject}.png`;
    const imageBuffer = Buffer.from(b64, "base64");

    const { error: uploadError } = await adminSupabase.storage
      .from("illustrations")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        {
          error: `画像のアップロードに失敗しました: ${uploadError.message}。Supabase の SQL Editor で supabase/migrations/003_create_illustrations_storage.sql を実行してください（バケット作成と Storage ポリシー）。`,
        },
        { status: 500 },
      );
    }

    const {
      data: { publicUrl: image_url },
    } = adminSupabase.storage.from("illustrations").getPublicUrl(fileName);

    const { error } = await adminSupabase.from("illustrations").insert({
      title,
      image_url,
      genre: classification.genre,
      sub_genre: classification.sub_genre,
      action,
      subject,
      tags: classification.tags,
      description: classification.description,
      approved: false,
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        {
          error: `データベースへの保存に失敗しました: ${error.message}`,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      title,
      image_url,
      action,
      subject,
      genre: classification.genre,
      sub_genre: classification.sub_genre,
      tags: classification.tags,
      description: classification.description,
      approved: false,
    });
  } catch (error) {
    console.error("Generate API error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
