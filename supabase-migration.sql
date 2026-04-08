-- ============================================
-- ArtStar ⭐ — Supabase Database Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT 'Little Artist',
  avatar_url TEXT DEFAULT '🦄',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'Little Artist'),
    '🦄'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ARTWORKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'drawing' CHECK (category IN ('drawing', 'coloring', 'painting', 'digital', 'craft', 'other')),
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON artworks(user_id);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);

-- ============================================
-- COMPETITIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  result TEXT DEFAULT 'participated' CHECK (result IN ('participated', 'finalist', 'winner', 'grand_winner')),
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitions_user_id ON competitions(user_id);

-- ============================================
-- BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INT NOT NULL
);

-- Seed badge data
INSERT INTO badges (id, name, description, icon, requirement_type, requirement_value)
VALUES
  ('first_artwork', 'Masterpiece Pertama!', 'Unggah karya seni pertamamu', '🎨', 'artwork_count', 1),
  ('two_artworks', 'Mulai Beraksi!', 'Unggah 2 karya seni', '🖌️', 'artwork_count', 2),
  ('five_artworks', 'Mesin Seni!', 'Unggah 5 karya seni luar biasa', '🖼️', 'artwork_count', 5),
  ('ten_artworks', 'Bintang Galeri!', 'Unggah 10 karya seni luar biasa', '⭐', 'artwork_count', 10),
  ('twenty_artworks', 'Kolektor Berlian!', 'Unggah 20 karya seni', '💎', 'artwork_count', 20),
  ('thirty_artworks', 'Seniman Berkilau!', 'Unggah 30 karya seni', '🌟', 'artwork_count', 30),
  ('fifty_artworks', 'Raja/Ratu Galeri!', 'Unggah 50 karya seni', '👑', 'artwork_count', 50),
  ('seventy_five_artworks', 'Legenda Seni!', 'Unggah 75 karya seni', '🔮', 'artwork_count', 75),
  ('hundred_artworks', 'Penguasa Alam Semesta Seni!', 'Unggah 100 karya seni', '🌌', 'artwork_count', 100),
  ('first_competition', 'Seniman Pemberani!', 'Ikuti lomba pertamamu', '🏅', 'competition_count', 1),
  ('two_competitions', 'Petarung Lomba!', 'Ikuti 2 lomba', '🥈', 'competition_count', 2),
  ('five_competitions', 'Pro Kompetisi!', 'Ikuti 5 lomba', '🎯', 'competition_count', 5),
  ('ten_competitions', 'Ksatria Lomba!', 'Ikuti 10 lomba', '⚔️', 'competition_count', 10),
  ('twenty_competitions', 'Benteng Prestasi!', 'Ikuti 20 lomba', '🛡️', 'competition_count', 20),
  ('fifty_competitions', 'Bintang Jatuh Prestasi!', 'Ikuti 50 lomba', '🌠', 'competition_count', 50),
  ('first_win', 'Juara!', 'Menangkan lomba — kamu luar biasa!', '🏆', 'first_win', 1),
  ('two_categories', 'Penjelajah Seni!', 'Buat karya di 2 kategori berbeda', '🎭', 'category_count', 2),
  ('colorful_creator', 'Kreator Penuh Warna!', 'Buat karya di 3 kategori berbeda', '🌈', 'category_count', 3),
  ('four_categories', 'Ahli Ragam Seni!', 'Buat karya di 4 kategori berbeda', '🧩', 'category_count', 4),
  ('master_creator', 'Master Segala Kategori!', 'Buat karya di 5 kategori berbeda', '🎆', 'category_count', 5),
  ('six_categories', 'Dewa Kreativitas!', 'Buat karya di 6 kategori berbeda', '🏅', 'category_count', 6),
  ('streak_3', 'Lagi On Fire!', 'Unggah 3 karya dalam satu minggu', '🔥', 'weekly_streak', 3),
  ('streak_5', 'Gunung Berapi!', 'Unggah 5 karya dalam satu minggu', '🌋', 'weekly_streak', 5),
  ('persistent_artist', 'Artis Gigih!', 'Unggah 10 karya dalam satu minggu', '🚀', 'weekly_streak', 10),
  ('streak_20', 'Komet Kreativitas!', 'Unggah 20 karya dalam satu minggu', '☄️', 'weekly_streak', 20)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  requirement_type = EXCLUDED.requirement_type,
  requirement_value = EXCLUDED.requirement_value;

-- ============================================
-- USER BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- ============================================
-- SHARES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('artwork', 'competition')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shares_item ON shares(item_type, item_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Artworks
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own artworks"
  ON artworks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own artworks"
  ON artworks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own artworks"
  ON artworks FOR DELETE
  USING (auth.uid() = user_id);

-- Competitions
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competitions"
  ON competitions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitions"
  ON competitions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitions"
  ON competitions FOR DELETE
  USING (auth.uid() = user_id);

-- User Badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Shares
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create own shares"
  ON shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view shares"
  ON shares FOR SELECT
  USING (true);

-- Public access to shared artworks
CREATE POLICY "Public can view shared artworks"
  ON artworks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shares
      WHERE shares.item_type = 'artwork'
        AND shares.item_id = artworks.id
    )
  );

-- Public access to shared competitions
CREATE POLICY "Public can view shared competitions"
  ON competitions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM shares
      WHERE shares.item_type = 'competition'
        AND shares.item_id = competitions.id
    )
  );

-- Badges table is public read
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  USING (true);

-- ============================================
-- STORAGE BUCKETS (run in Dashboard → Storage)
-- ============================================
-- Create two buckets:
-- 1. "artworks" — for artwork images
-- 2. "certificates" — for competition certificates
-- 
-- For each bucket, add these policies:
-- Upload: authenticated users can upload to their own folder
-- Read: public access (for sharing)
