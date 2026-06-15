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
        { error: "action 縺ｨ subject 縺ｯ蠢・医〒縺・ },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY 縺瑚ｨｭ螳壹＆繧後※縺・∪縺帙ｓ縲・ },
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
        { error: "逕ｻ蜒上・逕滓・縺ｫ螟ｱ謨励＠縺ｾ縺励◆" },
        { status: 500 },
      );
    }

    const base64Image = b64;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
    const supabase = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const fileName = `${Date.now()}.png`;
    const imageBuffer = Buffer.from(base64Image, "base64");
    const { error: uploadError } = await supabase.storage
      .from("illustrations")
      .upload(fileName, imageBuffer, { contentType: "image/png" });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("illustrations")
      .getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    let classification;
    try {
      classification = await classifyImageWithClaude(base64Image);
    } catch (classifyError) {
      console.error("Claude classification error:", classifyError);
      classification = fallbackClassification(action, subject);
    }

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
      error instanceof Error ? error.message : "莠域悄縺励↑縺・お繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
