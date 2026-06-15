"use server";

import { verifyAdminPassword } from "@/app/lib/admin-auth";
import type { IllustrationRecord } from "@/app/lib/illustration-db";
import { adminSupabase } from "@/app/lib/supabase-admin";

type ActionResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: string };

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
