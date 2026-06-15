-- 生成API用 RLS 修正（Supabase Dashboard > SQL Editor で実行）
-- 未承認イラストの INSERT を許可

DROP POLICY IF EXISTS "Anyone can insert pending illustrations" ON illustrations;

CREATE POLICY "Anyone can insert pending illustrations"
  ON illustrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (approved = FALSE);
