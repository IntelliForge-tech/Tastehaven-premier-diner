-- Phase 12A — Hero Section CMS
-- Extends the existing hero_settings table with all fields needed by the
-- Hero CMS admin page. Uses ADD COLUMN IF NOT EXISTS so the migration is
-- safe to run even if some columns were added manually.
--
-- Run this in the Supabase SQL editor or via the Supabase CLI:
--   supabase db push  (if using local migrations)
--   or paste directly into Dashboard → SQL Editor

-- 1. Add Phase 12A columns to hero_settings
ALTER TABLE public.hero_settings
  ADD COLUMN IF NOT EXISTS headline_highlight  TEXT,
  ADD COLUMN IF NOT EXISTS headline_suffix     TEXT,
  ADD COLUMN IF NOT EXISTS badge_text          TEXT,
  ADD COLUMN IF NOT EXISTS description         TEXT,
  ADD COLUMN IF NOT EXISTS primary_button_text TEXT,
  ADD COLUMN IF NOT EXISTS primary_button_link TEXT,
  ADD COLUMN IF NOT EXISTS secondary_button_text TEXT,
  ADD COLUMN IF NOT EXISTS secondary_button_link TEXT,
  ADD COLUMN IF NOT EXISTS overlay_opacity     INTEGER NOT NULL DEFAULT 70
                             CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100),
  ADD COLUMN IF NOT EXISTS is_visible          BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Seed the singleton row if it doesn't exist yet.
--    The fixed UUID matches HERO_SINGLETON_ID in hero.service.ts.
INSERT INTO public.hero_settings (
  id,
  headline,
  headline_highlight,
  headline_suffix,
  badge_text,
  description,
  primary_button_text,
  primary_button_link,
  secondary_button_text,
  secondary_button_link,
  background_image_url,
  overlay_opacity,
  is_visible,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Fresh Ingredients.',
  'Memorable',
  'Experiences.',
  'Now taking reservations',
  'A modern dining haven where seasonal produce, wood-fire craftsmanship, and warm hospitality meet — night after night.',
  'Reserve Table',
  'reserve',
  'View Menu',
  'menu',
  NULL,
  70,
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS: allow authenticated admins to read and update hero_settings.
--    Matches the pattern used by the existing RLS policies on other CMS tables.

-- Public read (public site loads hero content without auth)
CREATE POLICY IF NOT EXISTS "hero_settings_public_read"
  ON public.hero_settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Admin write (only authenticated admins can update)
CREATE POLICY IF NOT EXISTS "hero_settings_admin_write"
  ON public.hero_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Enable RLS on the table (safe to run even if already enabled)
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

-- 4. Allow the hero/ folder in the restaurant-media storage bucket.
--    If the bucket policy already permits all paths under restaurant-media
--    no additional policy is needed here. If your bucket uses path-level
--    policies, add:
--
-- INSERT INTO storage.policies (name, bucket_id, operation, definition)
-- VALUES (
--   'hero_images_public_read',
--   'restaurant-media',
--   'SELECT',
--   'bucket_id = ''restaurant-media'''
-- )
-- ON CONFLICT DO NOTHING;
--
-- Adjust to match your existing bucket policy structure.
