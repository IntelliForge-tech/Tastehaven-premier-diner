-- Phase 12E — Footer CMS
-- Extends footer_settings singleton and creates quick_links table.
-- All operations are idempotent and safe to run multiple times.

-- ─── 1. Extend footer_settings ────────────────────────────────────────────────

ALTER TABLE public.footer_settings
  ADD COLUMN IF NOT EXISTS restaurant_name          TEXT,
  ADD COLUMN IF NOT EXISTS short_description        TEXT,
  ADD COLUMN IF NOT EXISTS copyright_year_auto      BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS copyright_year_manual    TEXT,
  ADD COLUMN IF NOT EXISTS designed_by_text         TEXT,
  ADD COLUMN IF NOT EXISTS designed_by_url          TEXT,
  ADD COLUMN IF NOT EXISTS show_logo                BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_description         BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_quick_links         BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_business_info       BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_newsletter          BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_social_icons        BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_legal               BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_copyright           BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS newsletter_title         TEXT,
  ADD COLUMN IF NOT EXISTS newsletter_subtitle      TEXT,
  ADD COLUMN IF NOT EXISTS newsletter_placeholder   TEXT,
  ADD COLUMN IF NOT EXISTS newsletter_button_text   TEXT,
  ADD COLUMN IF NOT EXISTS newsletter_success_msg   TEXT,
  ADD COLUMN IF NOT EXISTS newsletter_error_msg     TEXT,
  ADD COLUMN IF NOT EXISTS newsletter_consent_text  TEXT,
  ADD COLUMN IF NOT EXISTS newsletter_enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS social_icon_size         TEXT NOT NULL DEFAULT 'md',
  ADD COLUMN IF NOT EXISTS social_icon_shape        TEXT NOT NULL DEFAULT 'circle',
  ADD COLUMN IF NOT EXISTS social_icon_style        TEXT NOT NULL DEFAULT 'outline',
  ADD COLUMN IF NOT EXISTS social_icon_alignment    TEXT NOT NULL DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS social_max_icons         INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS privacy_policy_url       TEXT,
  ADD COLUMN IF NOT EXISTS terms_url                TEXT,
  ADD COLUMN IF NOT EXISTS cookies_url              TEXT,
  ADD COLUMN IF NOT EXISTS refund_url               TEXT,
  ADD COLUMN IF NOT EXISTS accessibility_statement  TEXT,
  ADD COLUMN IF NOT EXISTS disclaimer               TEXT,
  ADD COLUMN IF NOT EXISTS license_text             TEXT,
  ADD COLUMN IF NOT EXISTS footer_layout            TEXT NOT NULL DEFAULT 'classic',
  ADD COLUMN IF NOT EXISTS background_color         TEXT,
  ADD COLUMN IF NOT EXISTS text_color               TEXT,
  ADD COLUMN IF NOT EXISTS accent_color             TEXT,
  ADD COLUMN IF NOT EXISTS border_style             TEXT NOT NULL DEFAULT 'solid',
  ADD COLUMN IF NOT EXISTS show_top_border          BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_divider             BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS container_width          TEXT NOT NULL DEFAULT '7xl',
  ADD COLUMN IF NOT EXISTS footer_enabled           BOOLEAN NOT NULL DEFAULT TRUE;

-- ─── 2. Seed / update footer_settings singleton ───────────────────────────────

INSERT INTO public.footer_settings (
  id,
  restaurant_name,
  tagline,
  short_description,
  copyright_text,
  copyright_year_auto,
  copyright_year_manual,
  designed_by_text,
  designed_by_url,
  show_logo,
  show_description,
  show_quick_links,
  show_business_info,
  show_newsletter,
  show_social_icons,
  show_legal,
  show_copyright,
  newsletter_title,
  newsletter_subtitle,
  newsletter_button_text,
  newsletter_placeholder,
  newsletter_success_msg,
  newsletter_error_msg,
  newsletter_consent_text,
  newsletter_enabled,
  social_icon_size,
  social_icon_shape,
  social_icon_style,
  social_icon_alignment,
  social_max_icons,
  footer_layout,
  border_style,
  show_top_border,
  show_divider,
  container_width,
  footer_enabled,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Taste Haven',
  'Fresh ingredients, memorable experiences.',
  'Fresh ingredients, memorable experiences — since 2012.',
  'All rights reserved.',
  TRUE,
  NULL,
  'Crafted with care in the Downtown District.',
  NULL,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  TRUE,
  'Newsletter',
  'Seasonal menus and private events, once a month.',
  'Join',
  'you@email.com',
  'Subscribed! Welcome to Taste Haven.',
  'Something went wrong. Please try again.',
  NULL,
  TRUE,
  'md',
  'circle',
  'outline',
  'left',
  4,
  'classic',
  'solid',
  TRUE,
  TRUE,
  '7xl',
  TRUE,
  NOW()
)
ON CONFLICT (id) DO UPDATE
  SET
    restaurant_name      = COALESCE(public.footer_settings.restaurant_name, EXCLUDED.restaurant_name),
    tagline              = COALESCE(public.footer_settings.tagline, EXCLUDED.tagline),
    short_description    = COALESCE(public.footer_settings.short_description, EXCLUDED.short_description),
    copyright_text       = COALESCE(public.footer_settings.copyright_text, EXCLUDED.copyright_text),
    newsletter_title     = COALESCE(public.footer_settings.newsletter_title, EXCLUDED.newsletter_title),
    newsletter_subtitle  = COALESCE(public.footer_settings.newsletter_subtitle, EXCLUDED.newsletter_subtitle),
    newsletter_button_text = COALESCE(public.footer_settings.newsletter_button_text, EXCLUDED.newsletter_button_text),
    newsletter_placeholder = COALESCE(public.footer_settings.newsletter_placeholder, EXCLUDED.newsletter_placeholder),
    newsletter_success_msg = COALESCE(public.footer_settings.newsletter_success_msg, EXCLUDED.newsletter_success_msg),
    newsletter_error_msg = COALESCE(public.footer_settings.newsletter_error_msg, EXCLUDED.newsletter_error_msg),
    designed_by_text     = COALESCE(public.footer_settings.designed_by_text, EXCLUDED.designed_by_text);

-- ─── 3. Create quick_links table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.quick_links (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  url            TEXT NOT NULL,
  display_order  INTEGER NOT NULL DEFAULT 0,
  open_new_tab   BOOLEAN NOT NULL DEFAULT FALSE,
  is_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. Seed default quick_links rows ────────────────────────────────────────

INSERT INTO public.quick_links (id, title, url, display_order, open_new_tab, is_enabled)
VALUES
  ('00000000-0000-0001-0000-000000000001', 'Menu',     '#menu',     1, FALSE, TRUE),
  ('00000000-0000-0001-0000-000000000002', 'About',    '#about',    2, FALSE, TRUE),
  ('00000000-0000-0001-0000-000000000003', 'Gallery',  '#gallery',  3, FALSE, TRUE),
  ('00000000-0000-0001-0000-000000000004', 'Reserve',  '#reserve',  4, FALSE, TRUE),
  ('00000000-0000-0001-0000-000000000005', 'Contact',  '#contact',  5, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── 5. RLS — footer_settings ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "footer_settings_public_read" ON public.footer_settings;
CREATE POLICY "footer_settings_public_read"
  ON public.footer_settings FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "footer_settings_admin_write" ON public.footer_settings;
CREATE POLICY "footer_settings_admin_write"
  ON public.footer_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;

-- ─── 6. RLS — quick_links ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "quick_links_public_read" ON public.quick_links;
CREATE POLICY "quick_links_public_read"
  ON public.quick_links FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "quick_links_admin_write" ON public.quick_links;
CREATE POLICY "quick_links_admin_write"
  ON public.quick_links FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;
