import { supabase } from "@/app/lib/supabase";

export type IllustrationRecord = {
  id: string;
  title: string;
  image_url: string;
  genre: string;
  sub_genre: string | null;
  action: string | null;
  subject: string | null;
  tags: string[] | null;
  description: string | null;
  approved: boolean;
  created_at: string;
  download_count: number;
};

const GENRE_CATEGORY_MAP: Record<string, string> = {
  動物: "animal",
  animal: "animal",
  食べ物: "food",
  food: "food",
  乗り物: "vehicle",
  vehicle: "vehicle",
  植物: "plant",
  plant: "plant",
  人物: "person",
  person: "person",
  スポーツ: "sports",
  sports: "sports",
  音楽: "music",
  music: "music",
};

export function buildGenreCategoryHref(genre: string): string {
  const cat = GENRE_CATEGORY_MAP[genre];
  return cat ? `/category?cat=${cat}` : "/category";
}

export const CATEGORY_GENRE_VALUES: Record<string, string[]> = {
  animal: ["動物", "animal"],
  food: ["食べ物", "food"],
  vehicle: ["乗り物", "vehicle"],
  plant: ["植物", "plant"],
  person: ["人物", "person"],
  sports: ["スポーツ", "sports"],
  music: ["音楽", "music"],
};


export async function fetchApprovedIllustration(
  id: string,
): Promise<IllustrationRecord | null> {
  const { data, error } = await supabase
    .from("illustrations")
    .select("*")
    .eq("id", id)
    .eq("approved", true)
    .single();

  if (error || !data) return null;
  return data as IllustrationRecord;
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  return `${days}日前`;
}
