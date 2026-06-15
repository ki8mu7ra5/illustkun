import Anthropic from "@anthropic-ai/sdk";
import {
  ACTION_CATEGORY_TAGS,
  IMAGE_CLASSIFY_PROMPT,
  type ActionCategoryTag,
  type ImageClassification,
} from "./classify";

const [TAG_SPORTS, TAG_EAT, TAG_VEHICLE, TAG_STUDY, TAG_MUSIC, TAG_LIFE] =
  ACTION_CATEGORY_TAGS;

function isActionCategoryTag(tag: string): tag is ActionCategoryTag {
  return ACTION_CATEGORY_TAGS.includes(tag as ActionCategoryTag);
}

function normalizeActionTags(tags: string[]): ActionCategoryTag[] {
  const valid = tags.filter(isActionCategoryTag);
  return valid.length > 0 ? valid : [TAG_LIFE];
}

function inferActionCategoryTag(action: string): ActionCategoryTag {
  if (
    /[\u30b9\u30dd\u30fc\u30c4\u904b\u52d5\u30b5\u30c3\u30ab\u30fc\u91ce\u7403\u30d0\u30b9\u30b1\u6c34\u6cf3\u30b9\u30ad\u30fc\u30c6\u30cb\u30b9\u30d0\u30ec\u30fc\u30b4\u30eb\u30d5\u8d70]/.test(
      action,
    )
  ) {
    return TAG_SPORTS;
  }
  if (/[\u98df\u98f2\u6599\u7406\u30e9\u30fc\u30e1\u30f3\u30b3\u30fc\u30d2\u30fc\u98df\u4e8b]/.test(action)) {
    return TAG_EAT;
  }
  if (
    /[\u4e57\u904b\u8ee2\u96fb\u8eca\u30d0\u30b9\u81ea\u8ee2\u8eca\u98db\u884c\u6a5f\u8239]/.test(
      action,
    )
  ) {
    return TAG_VEHICLE;
  }
  if (/[\u52c9\u5f37\u8aad\u66f8\u4ed5\u4e8b\u6307\u5c06\u68cb]/.test(action)) {
    return TAG_STUDY;
  }
  if (/[\u97f3\u697d\u30ae\u30bf\u30fc\u30d4\u30a2\u30ce\u6f14\u594f\u6b4c\u30c0\u30f3\u30b9]/.test(action)) {
    return TAG_MUSIC;
  }
  return TAG_LIFE;
}

function parseClassification(text: string): ImageClassification {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Classification JSON not found");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Partial<ImageClassification>;

  if (!parsed.genre || !parsed.sub_genre || !parsed.action || !parsed.description) {
    throw new Error("Classification response missing required fields");
  }

  return {
    genre: String(parsed.genre).trim(),
    sub_genre: String(parsed.sub_genre).trim(),
    action: String(parsed.action).trim(),
    tags: normalizeActionTags(
      Array.isArray(parsed.tags)
        ? parsed.tags.map((tag) => String(tag).trim()).filter(Boolean)
        : [],
    ),
    description: String(parsed.description).trim().slice(0, 30),
  };
}

export async function classifyImageWithClaude(
  imageBase64: string,
): Promise<ImageClassification> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
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
    throw new Error("Claude API returned no text response");
  }

  return parseClassification(textBlock.text);
}

export function fallbackClassification(
  action: string,
  subject: string,
): ImageClassification {
  return {
    genre: "\u52d5\u7269",
    sub_genre: subject,
    action,
    tags: [inferActionCategoryTag(action)],
    description: `${action}${subject}`.slice(0, 30),
  };
}
