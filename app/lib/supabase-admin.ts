import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _adminSupabase: SupabaseClient | null = null;

function getAdminSupabase(): SupabaseClient {
  if (!_adminSupabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY が設定されていません。.env.local を保存したあと、npm run dev を再起動してください。",
      );
    }
    _adminSupabase = createClient(url, key);
  }
  return _adminSupabase;
}

/** service_role キーで RLS をバイパスする管理者用クライアント */
export const adminSupabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getAdminSupabase();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
