import type { IllustrationFilters } from "@/app/lib/filter-illustrations";
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

const ILLUSTRATION_LIST_SELECT =
  "id, title, image_url, genre, sub_genre, subject, action, tags, created_at, download_count";

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

export async function fetchApprovedIllustrationsList(
  filters: Pick<IllustrationFilters, "cat" | "tags" | "action" | "subject" | "sort">,
): Promise<IllustrationRecord[]> {
  let query = supabase
    .from("illustrations")
    .select(ILLUSTRATION_LIST_SELECT)
    .eq("approved", true);

  if (filters.cat && filters.cat !== "new") {
    const genres = CATEGORY_GENRE_VALUES[filters.cat] ?? [filters.cat];
    query = query.in("genre", genres);
  }

  if (filters.tags.length > 0) {
    query = query.overlaps("tags", filters.tags);
  }

  const actionTrimmed = filters.action.trim();
  if (actionTrimmed) {
    query = query.or(
      `title.ilike.%${actionTrimmed}%,action.ilike.%${actionTrimmed}%`,
    );
  }

  const subjectTrimmed = filters.subject.trim();
  if (subjectTrimmed) {
    query = query.or(
      `title.ilike.%${subjectTrimmed}%,subject.ilike.%${subjectTrimmed}%`,
    );
  }

  if (filters.sort === "popular") {
    query = query
      .order("download_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("fetchApprovedIllustrationsList error:", error);
    return [];
  }

  return data as IllustrationRecord[];
}

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

export type RankingIllustration = IllustrationRecord & {
  monthly_download_count: number;
};

export async function fetchMonthlyRanking(
  limit = 10,
): Promise<RankingIllustration[]> {
  const { adminSupabase } = await import("@/app/lib/supabase-admin");

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const { data: logs, error: logsError } = await adminSupabase
    .from("download_logs")
    .select("illustration_id")
    .gte("downloaded_at", oneMonthAgo.toISOString());

  if (logsError || !logs || logs.length === 0) {
    return [];
  }

  const monthlyCounts = new Map<string, number>();
  for (const log of logs) {
    const illustrationId = log.illustration_id as string;
    monthlyCounts.set(
      illustrationId,
      (monthlyCounts.get(illustrationId) ?? 0) + 1,
    );
  }

  const topEntries = [...monthlyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (topEntries.length === 0) {
    return [];
  }

  const topIds = topEntries.map(([illustrationId]) => illustrationId);

  const { data: illustrations, error: illustrationsError } = await adminSupabase
    .from("illustrations")
    .select("*")
    .in("id", topIds)
    .eq("approved", true);

  if (illustrationsError || !illustrations) {
    return [];
  }

  const illustrationMap = new Map(
    (illustrations as IllustrationRecord[]).map((item) => [item.id, item]),
  );

  return topEntries
    .map(([illustrationId, monthly_download_count]) => {
      const illustration = illustrationMap.get(illustrationId);
      if (!illustration) return null;
      return {
        ...illustration,
        monthly_download_count,
      };
    })
    .filter((item): item is RankingIllustration => item !== null);
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
