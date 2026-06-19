"use server";

import { verifyAdminPassword } from "@/app/lib/admin-auth";
import { ACTION_CATEGORY_TAGS } from "@/app/lib/classify";
import type { IllustrationRecord } from "@/app/lib/illustration-db";
import { adminSupabase } from "@/app/lib/supabase-admin";

type ActionResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: string };

export type IllustrationUpdatePayload = {
  title: string;
  genre: string;
  sub_genre: string | null;
  action: string | null;
  subject: string | null;
  tags: string[];
  description: string | null;
};

const GENRE_OPTIONS = [
  "動物",
  "食べ物",
  "乗り物",
  "植物",
  "人物",
  "スポーツ",
  "音楽",
] as const;

function normalizeUpdatePayload(
  payload: IllustrationUpdatePayload,
): IllustrationUpdatePayload | { error: string } {
  const title = payload.title.trim();
  if (!title) {
    return { error: "タイトルを入力してください" };
  }

  const genre = payload.genre.trim();
  if (!genre || !GENRE_OPTIONS.includes(genre as (typeof GENRE_OPTIONS)[number])) {
    return { error: "カテゴリを選択してください" };
  }

  const tags = payload.tags.filter((tag) =>
    ACTION_CATEGORY_TAGS.includes(tag as (typeof ACTION_CATEGORY_TAGS)[number]),
  );
  if (tags.length === 0) {
    return { error: "タグを1つ以上選択してください" };
  }

  return {
    title,
    genre,
    sub_genre: payload.sub_genre?.trim() || null,
    action: payload.action?.trim() || null,
    subject: payload.subject?.trim() || null,
    tags,
    description: payload.description?.trim() || null,
  };
}

export async function updateIllustration(
  password: string,
  id: string,
  payload: IllustrationUpdatePayload,
): Promise<ActionResult<IllustrationRecord>> {
  if (!verifyAdminPassword(password)) {
    return { error: "認証に失敗しました" };
  }

  const normalized = normalizeUpdatePayload(payload);
  if ("error" in normalized) {
    return { error: normalized.error };
  }

  const { data, error } = await adminSupabase
    .from("illustrations")
    .update(normalized)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: data as IllustrationRecord };
}

export async function getPendingIllustrations(
  password: string,
): Promise<ActionResult<IllustrationRecord[]>> {
  if (!verifyAdminPassword(password)) {
    return { error: "認証に失敗しました" };
  }

  const { data, error } = await adminSupabase
    .from("illustrations")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: (data ?? []) as IllustrationRecord[] };
}

export async function getApprovedIllustrations(
  password: string,
): Promise<ActionResult<IllustrationRecord[]>> {
  if (!verifyAdminPassword(password)) {
    return { error: "認証に失敗しました" };
  }

  const { data, error } = await adminSupabase
    .from("illustrations")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data: (data ?? []) as IllustrationRecord[] };
}

export async function approveIllustration(
  password: string,
  id: string,
): Promise<ActionResult<IllustrationRecord>> {
  if (!verifyAdminPassword(password)) {
    return { error: "認証に失敗しました" };
  }

  const { data, error } = await adminSupabase
    .from("illustrations")
    .update({ approved: true })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data: data as IllustrationRecord };
}

export async function rejectIllustration(
  password: string,
  id: string,
): Promise<ActionResult<{ success: true }>> {
  if (!verifyAdminPassword(password)) {
    return { error: "認証に失敗しました" };
  }

  const { error } = await adminSupabase.from("illustrations").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { data: { success: true } };
}
