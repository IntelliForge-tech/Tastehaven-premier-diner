-- ============================================================
-- Phase 12C — Contact Information & Social Links CMS
-- Run in Supabase SQL Editor or via supabase db push
-- ============================================================

-- ── 1. contact_information singleton ────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_information (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Phone
  primary_phone               TEXT NOT NULL DEFAULT '',
  secondary_phone             TEXT,
  whatsapp_number             TEXT,
  reservation_phone           TEXT,
  -- Email
  primary_email               TEXT NOT NULL DEFAULT '',
  secondary_email             TEXT,
  customer_support_email      TEXT,
  -- Address
  street_address              TEXT NOT NULL DEFAULT '',
  area                        TEXT,
  city                        TEXT NOT NULL DEFAULT '',
  state                       TEXT,
  country                     TEXT,
  postal_code                 TEXT,
  -- Links
  google_maps_url             TEXT,
  website_url                 TEXT,
  -- Messaging
  business_hours_note         TEXT,
  emergency_contact           TEXT,
  customer_service_message    TEXT,
  response_time_message       TEXT,
  -- Feature toggles
  live_chat_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
  reservation_contact_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  whatsapp_button_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  call_button_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  email_button_enabled        BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add any columns that might be missing if table already exists
ALTER TABLE public.contact_information
  ADD COLUMN IF NOT EXISTS secondary_phone             TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number             TEXT,
  ADD COLUMN IF NOT EXISTS reservation_phone           TEXT,
  ADD COLUMN IF NOT EXISTS secondary_email             TEXT,
  ADD COLUMN IF NOT EXISTS customer_support_email      TEXT,
  ADD COLUMN IF NOT EXISTS area                        TEXT,
  ADD COLUMN IF NOT EXISTS state                       TEXT,
  ADD COLUMN IF NOT EXISTS country                     TEXT,
  ADD COLUMN IF NOT EXISTS postal_code                 TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url             TEXT,
  ADD COLUMN IF NOT EXISTS website_url                 TEXT,
  ADD COLUMN IF NOT EXISTS business_hours_note         TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact           TEXT,
  ADD COLUMN IF NOT EXISTS customer_service_message    TEXT,
  ADD COLUMN IF NOT EXISTS response_time_message       TEXT,
  ADD COLUMN IF NOT EXISTS live_chat_enabled           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reservation_contact_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS whatsapp_button_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS call_button_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS email_button_enabled        BOOLEAN NOT NULL DEFAULT TRUE;

-- Seed singleton row
INSERT INTO public.contact_information (
  id,
  primary_phone,
  secondary_phone,
  whatsapp_number,
  reservation_phone,
  primary_email,
  secondary_email,
  customer_support_email,
  street_address,
  area,
  city,
  state,
  country,
  postal_code,
  google_maps_url,
  website_url,
  business_hours_note,
  emergency_contact,
  customer_service_message,
  response_time_message,
  live_chat_enabled,
  reservation_contact_enabled,
  whatsapp_button_enabled,
  call_button_enabled,
  email_button_enabled,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000020',
  '+1 (415) 555 0138',
  NULL,
  NULL,
  '+1 (415) 555 0138',
  'hello@tastehaven.co',
  NULL,
  'support@tastehaven.co',
  '42 Amber Street',
  'Downtown District',
  'San Francisco',
  'CA',
  'United States',
  '94103',
  'https://www.google.com/maps?q=San+Francisco+downtown',
  'https://tastehaven.co',
  'Mon–Sun · 5 PM – 12 AM',
  NULL,
  'We''re here to help! Reach us anytime.',
  'We typically respond within 24 hours.',
  FALSE,
  TRUE,
  FALSE,
  TRUE,
  TRUE,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  primary_phone               = EXCLUDED.primary_phone,
  primary_email               = EXCLUDED.primary_email,
  street_address              = EXCLUDED.street_address,
  city                        = EXCLUDED.city,
  updated_at                  = NOW();

-- RLS
ALTER TABLE public.contact_information ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_information_public_read" ON public.contact_information;
CREATE POLICY "contact_information_public_read"
  ON public.contact_information FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "contact_information_admin_write" ON public.contact_information;
CREATE POLICY "contact_information_admin_write"
  ON public.contact_information FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 2. contact_social_links singleton ───────────────────────
CREATE TABLE IF NOT EXISTS public.contact_social_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  links      JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contact_social_links
  ADD COLUMN IF NOT EXISTS links      JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Seed singleton with all 19 platforms disabled
INSERT INTO public.contact_social_links (id, links, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  '[
    {"platform":"facebook",        "label":"Facebook",             "url":"","enabled":false,"openInNewTab":true,"displayOrder":0, "icon":"facebook",       "faIcon":"fa-facebook"},
    {"platform":"instagram",       "label":"Instagram",            "url":"","enabled":false,"openInNewTab":true,"displayOrder":1, "icon":"instagram",      "faIcon":"fa-instagram"},
    {"platform":"twitter",         "label":"Twitter / X",          "url":"","enabled":false,"openInNewTab":true,"displayOrder":2, "icon":"x-twitter",      "faIcon":"fa-x-twitter"},
    {"platform":"linkedin",        "label":"LinkedIn",             "url":"","enabled":false,"openInNewTab":true,"displayOrder":3, "icon":"linkedin",       "faIcon":"fa-linkedin"},
    {"platform":"youtube",         "label":"YouTube",              "url":"","enabled":false,"openInNewTab":true,"displayOrder":4, "icon":"youtube",        "faIcon":"fa-youtube"},
    {"platform":"tiktok",          "label":"TikTok",               "url":"","enabled":false,"openInNewTab":true,"displayOrder":5, "icon":"tiktok",         "faIcon":"fa-tiktok"},
    {"platform":"pinterest",       "label":"Pinterest",            "url":"","enabled":false,"openInNewTab":true,"displayOrder":6, "icon":"pinterest",      "faIcon":"fa-pinterest"},
    {"platform":"threads",         "label":"Threads",              "url":"","enabled":false,"openInNewTab":true,"displayOrder":7, "icon":"threads",        "faIcon":"fa-threads"},
    {"platform":"snapchat",        "label":"Snapchat",             "url":"","enabled":false,"openInNewTab":true,"displayOrder":8, "icon":"snapchat",       "faIcon":"fa-snapchat"},
    {"platform":"telegram",        "label":"Telegram",             "url":"","enabled":false,"openInNewTab":true,"displayOrder":9, "icon":"telegram",       "faIcon":"fa-telegram"},
    {"platform":"discord",         "label":"Discord",              "url":"","enabled":false,"openInNewTab":true,"displayOrder":10,"icon":"discord",        "faIcon":"fa-discord"},
    {"platform":"tripadvisor",     "label":"TripAdvisor",          "url":"","enabled":false,"openInNewTab":true,"displayOrder":11,"icon":"tripadvisor",    "faIcon":"fa-tripadvisor"},
    {"platform":"google_business", "label":"Google Business",      "url":"","enabled":false,"openInNewTab":true,"displayOrder":12,"icon":"google",         "faIcon":"fa-google"},
    {"platform":"yelp",            "label":"Yelp",                 "url":"","enabled":false,"openInNewTab":true,"displayOrder":13,"icon":"yelp",           "faIcon":"fa-yelp"},
    {"platform":"zomato",          "label":"Zomato",               "url":"","enabled":false,"openInNewTab":true,"displayOrder":14,"icon":"utensils",       "faIcon":"fa-utensils"},
    {"platform":"swiggy",          "label":"Swiggy",               "url":"","enabled":false,"openInNewTab":true,"displayOrder":15,"icon":"bag-shopping",   "faIcon":"fa-bag-shopping"},
    {"platform":"ubereats",        "label":"Uber Eats",            "url":"","enabled":false,"openInNewTab":true,"displayOrder":16,"icon":"uber",           "faIcon":"fa-uber"},
    {"platform":"doordash",        "label":"DoorDash",             "url":"","enabled":false,"openInNewTab":true,"displayOrder":17,"icon":"door-open",      "faIcon":"fa-door-open"},
    {"platform":"opentable",       "label":"OpenTable",            "url":"","enabled":false,"openInNewTab":true,"displayOrder":18,"icon":"calendar-check", "faIcon":"fa-calendar-check"}
  ]'::jsonb,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.contact_social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_social_links_public_read" ON public.contact_social_links;
CREATE POLICY "contact_social_links_public_read"
  ON public.contact_social_links FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "contact_social_links_admin_write" ON public.contact_social_links;
CREATE POLICY "contact_social_links_admin_write"
  ON public.contact_social_links FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
