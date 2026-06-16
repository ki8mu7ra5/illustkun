import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://illustkun.jp";

const SITEMAP_ENTRY = {
  changeFrequency: "daily" as const,
  priority: 0.8,
};

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      ...SITEMAP_ENTRY,
    },
    {
      url: `${SITE_URL}/ranking`,
      lastModified: new Date(),
      ...SITEMAP_ENTRY,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Sitemap: Supabase credentials are not configured");
    return staticPages;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("illustrations")
    .select("id, created_at")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Sitemap illustrations fetch error:", error);
    return staticPages;
  }

  const illustrationPages: MetadataRoute.Sitemap = (data ?? []).map((item) => ({
    url: `${SITE_URL}/illustration/${item.id}`,
    lastModified: new Date(item.created_at),
    ...SITEMAP_ENTRY,
  }));

  return [...staticPages, ...illustrationPages];
}
