export const IMAGE_CLASSIFY_PROMPT = `この画像を見て、以下のJSONのみ返してください。説明不要。
{
  "genre": "大ジャンル（動物・食べ物・乗り物など）",
  "sub_genre": "サブジャンル（犬・猫・鳥など）",
  "action": "行動（勉強・料理・スポーツなど）",
  "tags": ["行動カテゴリタグ"],
  "description": "30文字以内の説明文"
}

tagsのルール（必ずこの中から選ぶ）：
- スポーツ・運動をしている → "スポーツ"
- 食べている・飲んでいる・ケーキ・食事 → "食べる"
- 乗り物に乗っている・運転している → "乗り物"
- 勉強・読書・仕事をしている → "勉強"
- 音楽・楽器を演奏している → "音楽"
- 日常生活・その他 → "生活"

必ず上記6つのタグのいずれか1つ以上を選んでください。`;

export const ACTION_CATEGORY_TAGS = [
  "スポーツ",
  "食べる",
  "乗り物",
  "勉強",
  "音楽",
  "生活",
] as const;

export type ActionCategoryTag = (typeof ACTION_CATEGORY_TAGS)[number];

export type ImageClassification = {
  genre: string;
  sub_genre: string;
  action: string;
  tags: string[];
  description: string;
};
