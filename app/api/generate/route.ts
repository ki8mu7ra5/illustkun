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
    const image_url = `data:image/png;base64,${b64}`;

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
          error: `データベースへの保存に失敗しました: ${error.message}。Supabase の SQL Editor で supabase/migrations/002_allow_insert_pending.sql を実行してください。`,
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
