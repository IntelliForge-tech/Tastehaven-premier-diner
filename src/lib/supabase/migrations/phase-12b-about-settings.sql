-- Phase 12B — About Section CMS
-- Extends the existing about_settings table with the fields needed by the
-- About CMS admin page. Uses ADD COLUMN IF NOT EXISTS throughout so the
-- migration is safe to run even if some columns were added manually.
--
-- Run this in the Supabase SQL editor or via the Supabase CLI:
--   supabase db push  (if using local migrations)
--   or paste directly into Dashboard → SQL Editor

-- 1. Add Phase 12B columns to about_settings
ALTER TABLE public.about_settings
  ADD COLUMN IF NOT EXISTS section_title TEXT,
  ADD COLUMN IF NOT EXISTS badge_year    TEXT,
  ADD COLUMN IF NOT EXISTS badge_text    TEXT,
  ADD COLUMN IF NOT EXISTS is_visible    BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Ensure the features column exists and is jsonb.
--    (It already exists in the original schema, but guard with IF NOT EXISTS.)
ALTER TABLE public.about_settings
  ADD COLUMN IF NOT EXISTS features JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. Seed the singleton row if it doesn't exist yet.
--    The fixed UUID matches ABOUT_SINGLETON_ID in about.service.ts.
INSERT INTO public.about_settings (
  id,
  section_title,
  headline,
  description,
  image_url,
  features,
  badge_year,
  badge_text,
  is_visible,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Our Story',
  'A haven for the curious palate.',
  'Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings. Every plate is a small ceremony.',
  NULL,
  '[
    {"icon": "seedling", "title": "Fresh Ingredients",  "description": "Sourced daily from local farms."},
    {"icon": "hat-chef",  "title": "Experienced Chefs", "description": "A team with global training."},
    {"icon": "fire",      "title": "Cozy Atmosphere",   "description": "Warm lighting, intimate seating."},
    {"icon": "bolt",      "title": "Fast Service",      "description": "Attentive, never rushed."}
  ]'::jsonb,
  '2012',
  'A decade of memorable evenings.',
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS: allow public read + authenticated admin write.
--    Mirrors the hero_settings policies from Phase 12A.
--
--    PostgreSQL does not support CREATE POLICY IF NOT EXISTS.
--    Using DROP POLICY IF EXISTS (no-op when absent) + CREATE POLICY instead.

-- Public read (public site loads about content without auth)
DROP POLICY IF EXISTS "about_settings_public_read" ON public.about_settings;
CREATE POLICY "about_settings_public_read"
  ON public.about_settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Admin write (only authenticated admins can update)
DROP POLICY IF EXISTS "about_settings_admin_write" ON public.about_settings;
CREATE POLICY "about_settings_admin_write"
  ON public.about_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Enable RLS (safe to run even if already enabled)
ALTER TABLE public.about_settings ENABLE ROW LEVEL SECURITY;