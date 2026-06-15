-- illustrations テーブル
-- Supabase Dashboard > SQL Editor で実行してください

CREATE TABLE IF NOT EXISTS illustrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  genre TEXT NOT NULL,
  sub_genre TEXT,
  action TEXT,
  subject TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  download_count INTEGER NOT NULL DEFAULT 0
);

-- 公開済みイラストの取得を高速化
CREATE INDEX IF NOT EXISTS illustrations_approved_created_at_idx
  ON illustrations (approved, created_at DESC);

CREATE INDEX IF NOT EXISTS illustrations_genre_idx
  ON illustrations (genre);

CREATE INDEX IF NOT EXISTS illustrations_tags_idx
  ON illustrations USING GIN (tags);

-- 匿名ユーザーは承認済みイラストのみ閲覧可能
ALTER TABLE illustrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved illustrations"
  ON illustrations
  FOR SELECT
  USING (approved = TRUE);
