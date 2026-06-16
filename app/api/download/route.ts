import { NextResponse } from "next/server";
import { adminSupabase } from "@/app/lib/supabase-admin";

type DownloadRequestBody = {
  id?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DownloadRequestBody;
    const id = body.id?.trim();

    if (!id) {
      return NextResponse.json({ error: "id は必須です" }, { status: 400 });
    }

    const { data: illustration, error: fetchError } = await adminSupabase
      .from("illustrations")
      .select("id, download_count, approved")
      .eq("id", id)
      .single();

    if (fetchError || !illustration || !illustration.approved) {
      return NextResponse.json(
        { error: "イラストが見つかりません" },
        { status: 404 },
      );
    }

    const { error: logError } = await adminSupabase
      .from("download_logs")
      .insert({ illustration_id: id });

    if (logError) {
      console.error("Download log insert error:", logError);
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    const { error: updateError } = await adminSupabase
      .from("illustrations")
      .update({ download_count: illustration.download_count + 1 })
      .eq("id", id);

    if (updateError) {
      console.error("Download count update error:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      download_count: illustration.download_count + 1,
    });
  } catch (error) {
    console.error("Download API error:", error);
    const message =
      error instanceof Error ? error.message : "予期しないエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
