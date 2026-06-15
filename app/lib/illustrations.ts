export type IllustrationTag = "スポーツ" | "食べる" | "乗り物" | "勉強" | "音楽" | "生活";
export type IllustrationGenre = "animal";
export type CategoryKey =
  | IllustrationGenre
  | "food"
  | "vehicle"
  | "plant"
  | "person"
  | "sports"
  | "music";

export type Illustration = {
  id: number;
  emoji: string;
  title: string;
  action: string;
  subject: string;
  tag: IllustrationTag;
  genre: IllustrationGenre;
  time: string;
  downloads: number;
};

export const ILLUSTRATIONS: Illustration[] = [
  { id: 1, emoji: "🐹", title: "勉強しているハムスター", action: "勉強", subject: "ハムスター", tag: "勉強", genre: "animal", time: "3分前", downloads: 120 },
  { id: 2, emoji: "🐈", title: "電車を運転している猫", action: "電車", subject: "猫", tag: "乗り物", genre: "animal", time: "12分前", downloads: 98 },
  { id: 3, emoji: "🐊", title: "サッカーをするワニ", action: "サッカー", subject: "ワニ", tag: "スポーツ", genre: "animal", time: "28分前", downloads: 87 },
  { id: 4, emoji: "🦍", title: "将棋を指しているゴリラ", action: "将棋", subject: "ゴリラ", tag: "勉強", genre: "animal", time: "1時間前", downloads: 76 },
  { id: 5, emoji: "🐧", title: "スキーをするペンギン", action: "スキー", subject: "ペンギン", tag: "スポーツ", genre: "animal", time: "2時間前", downloads: 65 },
  { id: 6, emoji: "🐻", title: "コーヒーを飲むクマ", action: "コーヒー", subject: "クマ", tag: "食べる", genre: "animal", time: "3時間前", downloads: 54 },
  { id: 7, emoji: "🦊", title: "ピアノを弾くキツネ", action: "ピアノ", subject: "キツネ", tag: "音楽", genre: "animal", time: "4時間前", downloads: 43 },
  { id: 8, emoji: "🐸", title: "釣りをしているカエル", action: "釣り", subject: "カエル", tag: "生活", genre: "animal", time: "5時間前", downloads: 38 },
  { id: 9, emoji: "🐼", title: "自転車に乗るパンダ", action: "自転車", subject: "パンダ", tag: "乗り物", genre: "animal", time: "6時間前", downloads: 32 },
  { id: 10, emoji: "🐰", title: "本を読んでいるウサギ", action: "読書", subject: "ウサギ", tag: "勉強", genre: "animal", time: "7時間前", downloads: 28 },
  { id: 11, emoji: "🦁", title: "料理をしているライオン", action: "料理", subject: "ライオン", tag: "食べる", genre: "animal", time: "8時間前", downloads: 24 },
  { id: 12, emoji: "🐮", title: "ギターを弾く牛", action: "ギター", subject: "牛", tag: "音楽", genre: "animal", time: "9時間前", downloads: 21 },
  { id: 13, emoji: "🦊", title: "バスケをするキツネ", action: "バスケ", subject: "キツネ", tag: "スポーツ", genre: "animal", time: "10時間前", downloads: 18 },
  { id: 14, emoji: "🐘", title: "新聞を読む象", action: "読書", subject: "象", tag: "生活", genre: "animal", time: "11時間前", downloads: 15 },
  { id: 15, emoji: "🐺", title: "ラーメンを食べるオオカミ", action: "ラーメン", subject: "オオカミ", tag: "食べる", genre: "animal", time: "12時間前", downloads: 12 },
  { id: 16, emoji: "🐯", title: "水泳をするトラ", action: "水泳", subject: "トラ", tag: "スポーツ", genre: "animal", time: "13時間前", downloads: 10 },
  { id: 17, emoji: "🦒", title: "バレーをするキリン", action: "バレー", subject: "キリン", tag: "スポーツ", genre: "animal", time: "14時間前", downloads: 8 },
  { id: 18, emoji: "🐑", title: "編み物をするヒツジ", action: "編み物", subject: "ヒツジ", tag: "生活", genre: "animal", time: "15時間前", downloads: 7 },
  { id: 19, emoji: "🐓", title: "ダンスをするニワトリ", action: "ダンス", subject: "ニワトリ", tag: "音楽", genre: "animal", time: "16時間前", downloads: 6 },
  { id: 20, emoji: "🐬", title: "サーフィンをするイルカ", action: "サーフィン", subject: "イルカ", tag: "スポーツ", genre: "animal", time: "17時間前", downloads: 5 },
];

export const TAG_FILTERS: { key: IllustrationTag; label: string; emoji: string }[] = [
  { key: "スポーツ", label: "スポーツ系", emoji: "⚽" },
  { key: "食べる", label: "食べる・飲む", emoji: "🍽" },
  { key: "乗り物", label: "乗り物系", emoji: "🚃" },
  { key: "勉強", label: "勉強・仕事", emoji: "📚" },
  { key: "音楽", label: "音楽・趣味", emoji: "🎵" },
  { key: "生活", label: "生活・日常", emoji: "🏠" },
];

export const CATEGORY_CHIPS: {
  key: CategoryKey | "";
  name: string;
  emoji: string;
  soon: boolean;
}[] = [
  { key: "", name: "すべて", emoji: "", soon: false },
  { key: "animal", name: "動物", emoji: "🐾", soon: false },
  { key: "food", name: "食べ物", emoji: "🍜", soon: true },
  { key: "vehicle", name: "乗り物", emoji: "🚃", soon: true },
  { key: "plant", name: "植物", emoji: "🌿", soon: true },
  { key: "person", name: "人物", emoji: "👤", soon: true },
  { key: "sports", name: "スポーツ", emoji: "⚽", soon: true },
  { key: "music", name: "音楽", emoji: "🎵", soon: true },
];

export const TOP_CATEGORY_CHIPS = CATEGORY_CHIPS.filter(
  (chip): chip is (typeof CATEGORY_CHIPS)[number] & { key: CategoryKey } =>
    chip.key !== "",
);
