-- Phase 12F — Site Settings CMS
-- ─────────────────────────────────────────────────────────────────────────────
-- Creates the site_settings singleton table (or extends it safely if it
-- already exists). Every column addition uses ADD COLUMN IF NOT EXISTS so
-- this script is fully idempotent and safe to re-run.
--
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Step 1: Create the table if it doesn't exist ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Step 2: Add all columns (safe to re-run) ─────────────────────────────────

-- General
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS website_name        TEXT NOT NULL DEFAULT 'Taste Haven',
  ADD COLUMN IF NOT EXISTS website_tagline     TEXT,
  ADD COLUMN IF NOT EXISTS website_description TEXT,
  ADD COLUMN IF NOT EXISTS website_url         TEXT,
  ADD COLUMN IF NOT EXISTS default_language    TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS timezone            TEXT NOT NULL DEFAULT 'America/Los_Angeles',
  ADD COLUMN IF NOT EXISTS business_currency   TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS theme_color         TEXT,
  ADD COLUMN IF NOT EXISTS primary_brand_color TEXT,
  ADD COLUMN IF NOT EXISTS secondary_brand_color TEXT,
  ADD COLUMN IF NOT EXISTS accent_color        TEXT;

-- SEO
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS meta_title          TEXT NOT NULL DEFAULT 'Taste Haven',
  ADD COLUMN IF NOT EXISTS meta_description    TEXT NOT NULL DEFAULT 'Fresh ingredients, memorable experiences.',
  ADD COLUMN IF NOT EXISTS meta_keywords       TEXT,
  ADD COLUMN IF NOT EXISTS canonical_url       TEXT,
  ADD COLUMN IF NOT EXISTS author              TEXT,
  ADD COLUMN IF NOT EXISTS publisher           TEXT,
  ADD COLUMN IF NOT EXISTS robots_meta         TEXT NOT NULL DEFAULT 'index, follow',
  ADD COLUMN IF NOT EXISTS google_verification TEXT,
  ADD COLUMN IF NOT EXISTS bing_verification   TEXT,
  ADD COLUMN IF NOT EXISTS yandex_verification TEXT,
  ADD COLUMN IF NOT EXISTS facebook_app_id     TEXT,
  ADD COLUMN IF NOT EXISTS twitter_username    TEXT,
  ADD COLUMN IF NOT EXISTS og_title            TEXT,
  ADD COLUMN IF NOT EXISTS og_description      TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url        TEXT,
  ADD COLUMN IF NOT EXISTS twitter_card_type   TEXT NOT NULL DEFAULT 'summary_large_image',
  ADD COLUMN IF NOT EXISTS og_site_name        TEXT,
  ADD COLUMN IF NOT EXISTS og_type             TEXT NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS og_locale           TEXT NOT NULL DEFAULT 'en_US';

-- Favicon & Branding
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS favicon_url         TEXT,
  ADD COLUMN IF NOT EXISTS apple_touch_icon_url TEXT,
  ADD COLUMN IF NOT EXISTS browser_theme_color TEXT,
  ADD COLUMN IF NOT EXISTS background_color    TEXT;

-- Analytics
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS google_analytics_id       TEXT,
  ADD COLUMN IF NOT EXISTS google_analytics_enabled  BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS google_tag_manager_id     TEXT,
  ADD COLUMN IF NOT EXISTS google_tag_manager_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS meta_pixel_id             TEXT,
  ADD COLUMN IF NOT EXISTS meta_pixel_enabled        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS microsoft_clarity_id      TEXT,
  ADD COLUMN IF NOT EXISTS microsoft_clarity_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hotjar_id                 TEXT,
  ADD COLUMN IF NOT EXISTS hotjar_enabled            BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS custom_header_script      TEXT,
  ADD COLUMN IF NOT EXISTS custom_body_script        TEXT,
  ADD COLUMN IF NOT EXISTS custom_footer_script      TEXT;

-- Search Engine
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS allow_indexing              BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS generate_robots_txt         BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS generate_sitemap            BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_structured_data      BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_local_business_schema BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_faq_schema           BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_organization_schema  BOOLEAN NOT NULL DEFAULT TRUE;

-- PWA
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS enable_pwa           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pwa_app_name         TEXT,
  ADD COLUMN IF NOT EXISTS pwa_short_name       TEXT,
  ADD COLUMN IF NOT EXISTS pwa_theme_color      TEXT,
  ADD COLUMN IF NOT EXISTS pwa_background_color TEXT,
  ADD COLUMN IF NOT EXISTS pwa_start_url        TEXT NOT NULL DEFAULT '/',
  ADD COLUMN IF NOT EXISTS pwa_display_mode     TEXT NOT NULL DEFAULT 'standalone',
  ADD COLUMN IF NOT EXISTS pwa_offline_support  BOOLEAN NOT NULL DEFAULT FALSE;

-- Global feature toggles
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS enable_animations         BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_scroll_to_top      BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_cookie_banner      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS enable_newsletter         BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_reservation_system BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_contact_form       BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_gallery            BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_testimonials       BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_chef_section       BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS enable_offers             BOOLEAN NOT NULL DEFAULT TRUE;

-- Maintenance
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS maintenance_mode                        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS maintenance_title                       TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_message                     TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_image_url                   TEXT,
  ADD COLUMN IF NOT EXISTS maintenance_expected_return             TEXT,
  ADD COLUMN IF NOT EXISTS allow_search_engines_during_maintenance BOOLEAN NOT NULL DEFAULT TRUE;


-- ── Step 3: Seed the singleton row ───────────────────────────────────────────
--
-- Fixed UUID matches SITE_SETTINGS_SINGLETON_ID in site-settings.service.ts.
-- ON CONFLICT DO UPDATE backfills any NULL columns on existing rows while
-- preserving values the admin has already saved.

INSERT INTO public.site_settings (
  id,
  website_name,
  website_tagline,
  website_description,
  default_language,
  timezone,
  business_currency,
  meta_title,
  meta_description,
  robots_meta,
  twitter_card_type,
  og_type,
  og_locale,
  og_site_name,
  pwa_app_name,
  pwa_short_name,
  pwa_start_url,
  pwa_display_mode,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Taste Haven',
  'Fresh ingredients, memorable experiences.',
  'A modern dining haven where seasonal produce, wood-fire craftsmanship, and warm hospitality meet — night after night.',
  'en',
  'America/Los_Angeles',
  'USD',
  'Taste Haven — Fresh Ingredients. Memorable Experiences.',
  'A modern dining haven where seasonal produce, wood-fire craftsmanship, and warm hospitality meet — night after night.',
  'index, follow',
  'summary_large_image',
  'website',
  'en_US',
  'Taste Haven',
  'Taste Haven',
  'Haven',
  '/',
  'standalone',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  -- Only backfill columns that are still NULL on the existing row.
  -- Never overwrites data the admin has already saved.
  website_name        = COALESCE(site_settings.website_name,        EXCLUDED.website_name),
  website_tagline     = COALESCE(site_settings.website_tagline,     EXCLUDED.website_tagline),
  website_description = COALESCE(site_settings.website_description, EXCLUDED.website_description),
  meta_title          = COALESCE(site_settings.meta_title,          EXCLUDED.meta_title),
  meta_description    = COALESCE(site_settings.meta_description,    EXCLUDED.meta_description),
  og_site_name        = COALESCE(site_settings.og_site_name,        EXCLUDED.og_site_name),
  pwa_app_name        = COALESCE(site_settings.pwa_app_name,        EXCLUDED.pwa_app_name),
  pwa_short_name      = COALESCE(site_settings.pwa_short_name,      EXCLUDED.pwa_short_name);


-- ── Step 4: Row Level Security ────────────────────────────────────────────────
--
-- PostgreSQL does not support CREATE POLICY IF NOT EXISTS.
-- Using DROP POLICY IF EXISTS (no-op when absent) + CREATE POLICY.

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read: public site reads meta tags, analytics IDs, feature flags.
DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read"
  ON public.site_settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Admin write: only authenticated admins can update.
DROP POLICY IF EXISTS "site_settings_admin_write" ON public.site_settings;
CREATE POLICY "site_settings_admin_write"
  ON public.site_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── Step 5: Verification ──────────────────────────────────────────────────────

SELECT
  id,
  website_name,
  meta_title,
  LEFT(meta_description, 60) AS meta_description_preview,
  allow_indexing,
  maintenance_mode,
  enable_pwa,
  updated_at
FROM public.site_settings
LIMIT 1;
