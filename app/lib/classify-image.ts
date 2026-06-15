import Anthropic from "@anthropic-ai/sdk";
import { IMAGE_CLASSIFY_PROMPT, type ImageClassification } from "./classify";

function parseClassification(text: string): ImageClassification {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("分類結果のJSONが見つかりませんでした");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Partial<ImageClassification>;

  if (!parsed.genre || !parsed.sub_genre || !parsed.action || !parsed.description) {
    throw new Error("分類結果に必須フィールドが不足しています");
  }

  return {
    genre: String(parsed.genre).trim(),
    sub_genre: String(parsed.sub_genre).trim(),
    action: String(parsed.action).trim(),
    tags: Array.isArray(parsed.tags)
      ? parsed.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 5)
      : [],
    description: String(parsed.description).trim().slice(0, 30),
  };
}

export async function classifyImageWithClaude(
  imageBase64: string,
): Promise<ImageClassification> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY が設定されていません");
  }

  const anthropic = new Anthropic({ apiKey });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: IMAGE_CLASSIFY_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude API からテキスト応答がありませんでした");
  }

  return parseClassification(textBlock.text);
}

export function fallbackClassification(
  action: string,
  subject: string,
): ImageClassification {
  return {
    genre: "動物",
    sub_genre: subject,
    action,
    tags: [subject, action].filter(Boolean),
    description: `${action}${subject}`.slice(0, 30),
  };
}
