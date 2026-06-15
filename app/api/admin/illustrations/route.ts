import { NextResponse } from "next/server";
import { assertAdminRequest } from "@/app/lib/admin-auth";
import { adminSupabase } from "@/app/lib/supabase-admin";

export async function GET(request: Request) {
  const authError = assertAdminRequest(request);
  if (authError) return authError;

  const { data, error } = await adminSupabase
    .from("illustrations")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
