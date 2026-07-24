-- Phase 13 — FAQ CRUD, Contact Messages Inbox, Restaurant Settings
-- Run in Supabase SQL Editor or via `supabase db push`.

-- ── 1. faqs ──────────────────────────────────────────────────────────────────
-- Table already exists from the initial migration; verify columns present.
ALTER TABLE public.faqs
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;

-- Add unique constraint on day_of_week for opening_hours (needed for upsert)
ALTER TABLE public.opening_hours
  DROP CONSTRAINT IF EXISTS opening_hours_day_of_week_key;
ALTER TABLE public.opening_hours
  ADD CONSTRAINT opening_hours_day_of_week_key UNIQUE (day_of_week);

-- ── 2. contact_messages ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name   TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  subject       TEXT,
  body          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'unread'
                  CHECK (status IN ('unread', 'read', 'archived')),
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public can insert (submit a contact form)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contact_messages'
      AND policyname = 'contact_messages_public_insert'
  ) THEN
    CREATE POLICY "contact_messages_public_insert"
      ON public.contact_messages
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (TRUE);
  END IF;
END $$;

-- Only admins can read and update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'contact_messages'
      AND policyname = 'contact_messages_admin_all'
  ) THEN
    CREATE POLICY "contact_messages_admin_all"
      ON public.contact_messages
      FOR ALL
      TO authenticated
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- ── 3. restaurant_info singleton ─────────────────────────────────────────────
-- Seed if the table is empty.
INSERT INTO public.restaurant_info (
  id, name, tagline, description, address, phone, email, updated_at
)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Taste Haven',
  'A haven for the curious palate.',
  'Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings.',
  '42 Amber Street, Downtown District, CA 94103',
  '+1 (415) 555 0138',
  'hello@tastehaven.co',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ── 4. opening_hours seed ────────────────────────────────────────────────────
-- Insert default hours for all 7 days if none exist.
INSERT INTO public.opening_hours (day_of_week, open_time, close_time, is_closed)
SELECT s.day, '17:00', '23:00', (s.day = 0)  -- Sunday closed
FROM generate_series(0, 6) AS s(day)
WHERE NOT EXISTS (SELECT 1 FROM public.opening_hours WHERE day_of_week = s.day);

-- ── 5. social_links seed ─────────────────────────────────────────────────────
INSERT INTO public.social_links (platform, url, icon, display_order, is_active)
VALUES
  ('instagram',  'https://instagram.com/',   'fa-instagram',  0, TRUE),
  ('facebook',   'https://facebook.com/',    'fa-facebook',   1, TRUE),
  ('x-twitter',  'https://x.com/',           'fa-x-twitter',  2, TRUE),
  ('tiktok',     'https://tiktok.com/',      'fa-tiktok',     3, FALSE)
ON CONFLICT DO NOTHING;

-- ── 6. RLS for faqs (public read, admin write) ──────────────────────────────
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'faqs' AND policyname = 'faqs_public_read'
  ) THEN
    CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT TO anon, authenticated USING (TRUE);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'faqs' AND policyname = 'faqs_admin_write'
  ) THEN
    CREATE POLICY "faqs_admin_write" ON public.faqs FOR ALL TO authenticated
      USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;
