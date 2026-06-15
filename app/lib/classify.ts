export const IMAGE_CLASSIFY_PROMPT = `この画像を見て、以下のJSONのみ返してください。説明不要。
{
  "genre": "大ジャンル（動物・食べ物・乗り物など）",
  "sub_genre": "サブジャンル（犬・猫・鳥など）",
  "action": "行動（勉強・料理・スポーツなど）",
  "tags": ["タグ1", "タグ2", "タグ3"],
  "description": "30文字以内の説明文"
}
タグのルール：動物名は漢字優先（猫・犬・熊）、
漢字がない場合はカタカナ（ハムスター・ペンギン）、
ひらがなは使わない`;

export type ImageClassification = {
  genre: string;
  sub_genre: string;
  action: string;
  tags: string[];
  description: string;
};
