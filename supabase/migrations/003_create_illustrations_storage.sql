-- illustrations ストレージバケット（パブリック）
-- Supabase Dashboard > SQL Editor で実行してください

INSERT INTO storage.buckets (id, name, public)
VALUES ('illustrations', 'illustrations', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public can view illustrations" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload illustrations" ON storage.objects;
DROP POLICY IF EXISTS "Public can view illustration images" ON storage.objects;

CREATE POLICY "Public can view illustrations"
ON storage.objects FOR SELECT
USING (bucket_id = 'illustrations');

CREATE POLICY "Service role can upload illustrations"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'illustrations');
