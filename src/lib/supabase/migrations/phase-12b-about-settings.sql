-- Phase 12B — About Section CMS
-- Extends the existing about_settings table with all fields needed by the
-- About CMS admin page. Uses ADD COLUMN IF NOT EXISTS so the migration is
-- safe to run even if some columns were added manually.
--
-- Run this in the Supabase SQL editor or via the Supabase CLI:
--   supabase db push  (if using local migrations)
--   or paste directly into Dashboard → SQL Editor

-- 1. Add Phase 12B columns to about_settings
ALTER TABLE public.about_settings
  ADD COLUMN IF NOT EXISTS section_title  TEXT,
  ADD COLUMN IF NOT EXISTS badge_label    TEXT,
  ADD COLUMN IF NOT EXISTS badge_year     TEXT,
  ADD COLUMN IF NOT EXISTS badge_subtext  TEXT,
  ADD COLUMN IF NOT EXISTS is_visible     BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Seed the singleton row if it doesn't exist yet.
--    The fixed UUID matches ABOUT_SINGLETON_ID in about.service.ts.
INSERT INTO public.about_settings (
  id,
  headline,
  description,
  image_url,
  features,
  section_title,
  badge_label,
  badge_year,
  badge_subtext,
  is_visible,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'A haven for the curious palate.',
  'Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings. Every plate is a small ceremony.',
  NULL,
  '[
    {"icon": "fa-seedling", "title": "Fresh Ingredients", "description": "Sourced daily from local farms."},
    {"icon": "fa-hat-chef", "title": "Experienced Chefs", "description": "A team with global training."},
    {"icon": "fa-fire", "title": "Cozy Atmosphere", "description": "Warm lighting, intimate seating."},
    {"icon": "fa-bolt", "title": "Fast Service", "description": "Attentive, never rushed."}
  ]'::jsonb,
  'Our Story',
  'Since',
  '2012',
  'A decade of memorable evenings.',
  TRUE,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS: allow authenticated admins to read and update about_settings.
--    Matches the pattern used by hero_settings and other CMS tables.

-- Public read (public site loads about content without auth)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'about_settings'
      AND policyname = 'about_settings_public_read'
  ) THEN
    CREATE POLICY "about_settings_public_read"
      ON public.about_settings
      FOR SELECT
      TO anon, authenticated
      USING (TRUE);
  END IF;
END $$;

-- Admin write (only authenticated admins can update)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'about_settings'
      AND policyname = 'about_settings_admin_write'
  ) THEN
    CREATE POLICY "about_settings_admin_write"
      ON public.about_settings
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Enable RLS on the table (safe to run even if already enabled)
ALTER TABLE public.about_settings ENABLE ROW LEVEL SECURITY;
