-- Phase 12C — Restaurant Information & Opening Hours CMS
-- Extends restaurant_info and opening_hours tables with all CMS fields.
-- Uses ADD COLUMN IF NOT EXISTS throughout — safe to run multiple times.

-- 1. Extend restaurant_info with all Phase 12C fields
ALTER TABLE public.restaurant_info
  ADD COLUMN IF NOT EXISTS short_description  TEXT,
  ADD COLUMN IF NOT EXISTS street_address     TEXT,
  ADD COLUMN IF NOT EXISTS city               TEXT,
  ADD COLUMN IF NOT EXISTS state              TEXT,
  ADD COLUMN IF NOT EXISTS country            TEXT,
  ADD COLUMN IF NOT EXISTS postal_code        TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url    TEXT,
  ADD COLUMN IF NOT EXISTS primary_phone      TEXT,
  ADD COLUMN IF NOT EXISTS secondary_phone    TEXT,
  ADD COLUMN IF NOT EXISTS primary_email      TEXT,
  ADD COLUMN IF NOT EXISTS secondary_email    TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number    TEXT,
  ADD COLUMN IF NOT EXISTS reservation_phone  TEXT,
  ADD COLUMN IF NOT EXISTS reservation_email  TEXT,
  ADD COLUMN IF NOT EXISTS website_url        TEXT,
  ADD COLUMN IF NOT EXISTS price_range        TEXT,
  ADD COLUMN IF NOT EXISTS cuisine_type       TEXT,
  ADD COLUMN IF NOT EXISTS established_year   TEXT,
  ADD COLUMN IF NOT EXISTS holiday_notice     TEXT,
  ADD COLUMN IF NOT EXISTS special_announcement TEXT,
  ADD COLUMN IF NOT EXISTS reservation_message TEXT,
  ADD COLUMN IF NOT EXISTS delivery_available    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS takeaway_available    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS outdoor_seating       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS private_dining        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parking_available     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pet_friendly          BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Seed the singleton row with defaults
INSERT INTO public.restaurant_info (
  id,
  name,
  tagline,
  description,
  short_description,
  street_address,
  city,
  state,
  country,
  postal_code,
  google_maps_url,
  primary_phone,
  secondary_phone,
  primary_email,
  secondary_email,
  whatsapp_number,
  reservation_phone,
  reservation_email,
  website_url,
  price_range,
  cuisine_type,
  established_year,
  holiday_notice,
  special_announcement,
  reservation_message,
  delivery_available,
  takeaway_available,
  outdoor_seating,
  private_dining,
  parking_available,
  wheelchair_accessible,
  pet_friendly,
  updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Taste Haven',
  'Fresh ingredients, memorable experiences.',
  'Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings.',
  'Fresh ingredients, memorable experiences — since 2012.',
  '42 Amber Street',
  'San Francisco',
  'CA',
  'USA',
  '94103',
  'https://www.google.com/maps?q=San+Francisco+downtown',
  '+1 (415) 555 0138',
  NULL,
  'hello@tastehaven.co',
  NULL,
  NULL,
  '+1 (415) 555 0138',
  'reservations@tastehaven.co',
  'https://tastehaven.co',
  '$$',
  'Contemporary American',
  '2012',
  NULL,
  NULL,
  'Reservations open daily from 5 PM. For groups of 8+, please call us directly.',
  FALSE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  FALSE,
  NOW()
)
ON CONFLICT (id) DO UPDATE
  SET
    name                   = EXCLUDED.name,
    tagline                = COALESCE(public.restaurant_info.tagline, EXCLUDED.tagline),
    description            = COALESCE(public.restaurant_info.description, EXCLUDED.description),
    short_description      = COALESCE(public.restaurant_info.short_description, EXCLUDED.short_description),
    street_address         = COALESCE(public.restaurant_info.street_address, EXCLUDED.street_address),
    city                   = COALESCE(public.restaurant_info.city, EXCLUDED.city),
    state                  = COALESCE(public.restaurant_info.state, EXCLUDED.state),
    country                = COALESCE(public.restaurant_info.country, EXCLUDED.country),
    postal_code            = COALESCE(public.restaurant_info.postal_code, EXCLUDED.postal_code),
    google_maps_url        = COALESCE(public.restaurant_info.google_maps_url, EXCLUDED.google_maps_url),
    primary_phone          = COALESCE(public.restaurant_info.primary_phone, EXCLUDED.primary_phone),
    primary_email          = COALESCE(public.restaurant_info.primary_email, EXCLUDED.primary_email),
    reservation_phone      = COALESCE(public.restaurant_info.reservation_phone, EXCLUDED.reservation_phone),
    reservation_email      = COALESCE(public.restaurant_info.reservation_email, EXCLUDED.reservation_email),
    website_url            = COALESCE(public.restaurant_info.website_url, EXCLUDED.website_url),
    price_range            = COALESCE(public.restaurant_info.price_range, EXCLUDED.price_range),
    cuisine_type           = COALESCE(public.restaurant_info.cuisine_type, EXCLUDED.cuisine_type),
    established_year       = COALESCE(public.restaurant_info.established_year, EXCLUDED.established_year),
    reservation_message    = COALESCE(public.restaurant_info.reservation_message, EXCLUDED.reservation_message);

-- 3. Ensure opening_hours rows exist for all 7 days (0=Sunday … 6=Saturday)
INSERT INTO public.opening_hours (id, day_of_week, open_time, close_time, is_closed, created_at, updated_at)
VALUES
  ('00000000-0000-0000-0001-000000000000', 0, '17:00', '23:00', FALSE, NOW(), NOW()),
  ('00000000-0000-0000-0001-000000000001', 1, '17:00', '23:00', FALSE, NOW(), NOW()),
  ('00000000-0000-0000-0001-000000000002', 2, '17:00', '23:00', FALSE, NOW(), NOW()),
  ('00000000-0000-0000-0001-000000000003', 3, '17:00', '23:00', FALSE, NOW(), NOW()),
  ('00000000-0000-0000-0001-000000000004', 4, '17:00', '01:00', FALSE, NOW(), NOW()),
  ('00000000-0000-0000-0001-000000000005', 5, '17:00', '01:00', FALSE, NOW(), NOW()),
  ('00000000-0000-0000-0001-000000000006', 6, '16:00', '23:00', FALSE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. RLS for restaurant_info
DROP POLICY IF EXISTS "restaurant_info_public_read" ON public.restaurant_info;
CREATE POLICY "restaurant_info_public_read"
  ON public.restaurant_info
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "restaurant_info_admin_write" ON public.restaurant_info;
CREATE POLICY "restaurant_info_admin_write"
  ON public.restaurant_info
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.restaurant_info ENABLE ROW LEVEL SECURITY;

-- 5. RLS for opening_hours
DROP POLICY IF EXISTS "opening_hours_public_read" ON public.opening_hours;
CREATE POLICY "opening_hours_public_read"
  ON public.opening_hours
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "opening_hours_admin_write" ON public.opening_hours;
CREATE POLICY "opening_hours_admin_write"
  ON public.opening_hours
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;
