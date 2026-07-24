-- Phase 12A — Hero Section CMS
-- ─────────────────────────────────────────────────────────────────────────────
-- ROOT CAUSE NOTE
-- ─────────────────────────────────────────────────────────────────────────────
-- The Hero CMS displayed "Couldn't load hero settings" because this migration
-- was never run against the live database. The actual hero_settings table still
-- only had its original 7 columns:
--
--   id, headline, subheadline, cta_text, cta_link, background_image_url, updated_at
--
-- hero.service.ts was already querying 10 new columns that did not exist yet,
-- causing Supabase to return a Postgres error on every SELECT, which the service
-- correctly surfaced as a load failure.
--
-- All application code (service, hooks, form, preview, public component) is
-- internally consistent — nothing in the TypeScript layer needs to change.
-- Running this migration is the only fix required.
-- ─────────────────────────────────────────────────────────────────────────────
--
-- HOW TO APPLY
-- ─────────────────────────────────────────────────────────────────────────────
-- Option A (recommended): Supabase Dashboard → SQL Editor → paste and run.
-- Option B: supabase db push (if using local migrations folder).
--
-- This script is fully idempotent — safe to run multiple times.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Step 1: Add the new CMS columns ─────────────────────────────────────────
--
-- Uses ADD COLUMN IF NOT EXISTS throughout so re-running never errors.
-- The legacy columns (subheadline, cta_text, cta_link) are left untouched —
-- they are simply superseded by the new columns and can be dropped later
-- once all data has been migrated.

ALTER TABLE public.hero_settings
  ADD COLUMN IF NOT EXISTS headline_highlight    TEXT,
  ADD COLUMN IF NOT EXISTS headline_suffix       TEXT,
  ADD COLUMN IF NOT EXISTS badge_text            TEXT,
  ADD COLUMN IF NOT EXISTS description           TEXT,
  ADD COLUMN IF NOT EXISTS primary_button_text   TEXT,
  ADD COLUMN IF NOT EXISTS primary_button_link   TEXT,
  ADD COLUMN IF NOT EXISTS secondary_button_text TEXT,
  ADD COLUMN IF NOT EXISTS secondary_button_link TEXT,
  ADD COLUMN IF NOT EXISTS overlay_opacity       INTEGER NOT NULL DEFAULT 70
                             CHECK (overlay_opacity >= 0 AND overlay_opacity <= 100),
  ADD COLUMN IF NOT EXISTS is_visible            BOOLEAN NOT NULL DEFAULT TRUE;


-- ── Step 2: Migrate any existing row from old columns → new columns ──────────
--
-- If a row was already inserted using the old schema (subheadline, cta_text,
-- cta_link), copy those values into the new columns so no content is lost.
-- Runs only when the old columns still exist AND they have non-null values.

DO $$
BEGIN
  -- Only run if the legacy subheadline column still exists on this table.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'hero_settings'
      AND column_name  = 'subheadline'
  ) THEN
    UPDATE public.hero_settings
    SET
      -- Map subheadline → description (best semantic match) when new column is still empty.
      description           = COALESCE(description, subheadline),
      -- Map cta_text / cta_link → primary button when new columns are still empty.
      primary_button_text   = COALESCE(primary_button_text, cta_text),
      primary_button_link   = COALESCE(primary_button_link, cta_link)
    WHERE
      subheadline IS NOT NULL
      OR cta_text IS NOT NULL
      OR cta_link IS NOT NULL;
  END IF;
END;
$$;


-- ── Step 3: Upsert the canonical singleton row ───────────────────────────────
--
-- Inserts the singleton row if it does not exist yet (fresh database).
-- If it already exists (existing database), updates only the new CMS columns
-- that are still NULL — preserving any values that were already saved by the
-- admin. Existing content is never overwritten.
--
-- The fixed UUID '00000000-0000-0000-0000-000000000001' matches
-- HERO_SINGLETON_ID in hero.service.ts.

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
ON CONFLICT (id) DO UPDATE SET
  -- Only backfill new columns that are still NULL on the existing row.
  -- This never overwrites content that the admin has already saved.
  headline_highlight    = COALESCE(hero_settings.headline_highlight,    EXCLUDED.headline_highlight),
  headline_suffix       = COALESCE(hero_settings.headline_suffix,       EXCLUDED.headline_suffix),
  badge_text            = COALESCE(hero_settings.badge_text,            EXCLUDED.badge_text),
  description           = COALESCE(hero_settings.description,           EXCLUDED.description),
  primary_button_text   = COALESCE(hero_settings.primary_button_text,   EXCLUDED.primary_button_text),
  primary_button_link   = COALESCE(hero_settings.primary_button_link,   EXCLUDED.primary_button_link),
  secondary_button_text = COALESCE(hero_settings.secondary_button_text, EXCLUDED.secondary_button_text),
  secondary_button_link = COALESCE(hero_settings.secondary_button_link, EXCLUDED.secondary_button_link);
-- overlay_opacity and is_visible already have NOT NULL DEFAULT values,
-- so they are always set correctly — no COALESCE needed for those.


-- ── Step 4: Row Level Security ───────────────────────────────────────────────
--
-- PostgreSQL does not support CREATE POLICY IF NOT EXISTS.
-- The compatible pattern is DROP POLICY IF EXISTS (which is safe even when
-- the policy doesn't exist) followed by CREATE POLICY.

-- Public read: the public homepage loads hero content without authentication.
DROP POLICY IF EXISTS "hero_settings_public_read" ON public.hero_settings;
CREATE POLICY "hero_settings_public_read"
  ON public.hero_settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Admin write: only authenticated admins can insert/update/delete.
DROP POLICY IF EXISTS "hero_settings_admin_write" ON public.hero_settings;
CREATE POLICY "hero_settings_admin_write"
  ON public.hero_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Enable RLS (safe to call even if already enabled).
ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;


-- ── Step 5: Verification query ───────────────────────────────────────────────
--
-- Run this after applying the migration to confirm the row looks correct.
-- Expected: one row with all new columns populated.

SELECT
  id,
  headline,
  headline_highlight,
  headline_suffix,
  badge_text,
  LEFT(description, 40) AS description_preview,
  primary_button_text,
  primary_button_link,
  secondary_button_text,
  secondary_button_link,
  background_image_url,
  overlay_opacity,
  is_visible,
  updated_at
FROM public.hero_settings
LIMIT 1;