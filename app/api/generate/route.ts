import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import {
  classifyImageWithClaude,
  fallbackClassification,
} from "@/app/lib/classify-image";

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
        { error: "action ? subject ?????" },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY ???????????.env.local ????????npm run dev ???????????",
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
        { error: "?????????????OpenAI?????????????????" },
        { status: 500 },
      );
    }

    const base64Image = b64;

    const fileName = `${Date.now()}-${subject}-${action}.png`;
    const imageBuffer = Buffer.from(base64Image, "base64");
    const { error: uploadError } = await supabase.storage
      .from("illustrations")
      .upload(fileName, imageBuffer, { contentType: "image/png" });
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage
      .from("illustrations")
      .getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    console.log("ANTHROPIC_KEY exists:", !!process.env.ANTHROPIC_API_KEY);

    let classification;
    try {
      classification = await classifyImageWithClaude(base64Image);
      console.log("Classification result:", classification);
    } catch (classifyError) {
      console.error("Claude classification error:", classifyError);
      classification = fallbackClassification(action, subject);
      console.log("Using fallback classification:", classification);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
    const supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("SUPABASE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabase
      .from("illustrations")
      .insert([
        {
          title: `${action} ${subject}`,
          image_url: imageUrl,
          action,
          subject,
          genre: classification.genre,
          sub_genre: classification.sub_genre,
          tags: classification.tags,
          description: classification.description,
          approved: false,
        },
      ])
      .select();

    if (error) {
      console.error("Insert error details:", JSON.stringify(error));
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Generate API error:", error);
    const message =
      error instanceof Error ? error.message : "???????????????";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

