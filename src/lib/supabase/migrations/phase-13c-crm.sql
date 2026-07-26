-- Phase 13C — Customer CRM & Loyalty Management System
-- ─────────────────────────────────────────────────────────────────────────────
-- Creates five new tables for the CRM system. All operations are idempotent:
-- CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS.
-- No existing tables or columns are modified or deleted.
--
-- Apply via: Supabase Dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. customers ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customers (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL DEFAULT '',
  avatar             TEXT,
  phone              TEXT,
  email              TEXT,
  birth_date         DATE,
  anniversary        DATE,
  preferred_language TEXT,
  address            TEXT,
  city               TEXT,
  country            TEXT,
  loyalty_tier       TEXT NOT NULL DEFAULT 'bronze'
                       CHECK (loyalty_tier IN ('bronze','silver','gold','platinum','diamond')),
  loyalty_points     INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  lifetime_points    INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
  total_visits       INTEGER NOT NULL DEFAULT 0 CHECK (total_visits >= 0),
  total_spending     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (total_spending >= 0),
  status             TEXT NOT NULL DEFAULT 'active'
                       CHECK (status IN ('active','inactive','blacklisted')),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Useful indexes for search and filter queries.
CREATE INDEX IF NOT EXISTS customers_email_idx   ON public.customers (email);
CREATE INDEX IF NOT EXISTS customers_phone_idx   ON public.customers (phone);
CREATE INDEX IF NOT EXISTS customers_status_idx  ON public.customers (status);
CREATE INDEX IF NOT EXISTS customers_tier_idx    ON public.customers (loyalty_tier);


-- ── 2. customer_notes ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  created_by  UUID REFERENCES public.admin_users (id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS customer_notes_customer_idx ON public.customer_notes (customer_id);


-- ── 3. customer_tags ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Prevent duplicate tag names (case-insensitive).
CREATE UNIQUE INDEX IF NOT EXISTS customer_tags_name_unique
  ON public.customer_tags (LOWER(name));


-- ── 4. customer_tag_assignments ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_tag_assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES public.customer_tags (id) ON DELETE CASCADE,
  UNIQUE (customer_id, tag_id)
);

CREATE INDEX IF NOT EXISTS cta_customer_idx ON public.customer_tag_assignments (customer_id);
CREATE INDEX IF NOT EXISTS cta_tag_idx      ON public.customer_tag_assignments (tag_id);


-- ── 5. customer_loyalty_history ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_loyalty_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers (id) ON DELETE CASCADE,
  points      INTEGER NOT NULL,
  action      TEXT NOT NULL
                CHECK (action IN ('earned','redeemed','adjusted','expired')),
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS loyalty_history_customer_idx
  ON public.customer_loyalty_history (customer_id);


-- ── 6. Seed default tags ─────────────────────────────────────────────────────

INSERT INTO public.customer_tags (name, color) VALUES
  ('VIP',              '#D4AF37'),
  ('Regular',          '#3B82F6'),
  ('First Time',       '#22C55E'),
  ('Birthday Guest',   '#EC4899'),
  ('Anniversary',      '#8B5CF6'),
  ('Corporate',        '#1E293B'),
  ('High Spender',     '#EF4444'),
  ('Inactive',         '#6B7280')
ON CONFLICT DO NOTHING;


-- ── 7. Row Level Security ────────────────────────────────────────────────────
--
-- Using DROP POLICY IF EXISTS + CREATE POLICY (PostgreSQL-compatible).
-- Never CREATE POLICY IF NOT EXISTS.

-- customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customers_admin_all" ON public.customers;
CREATE POLICY "customers_admin_all"
  ON public.customers FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- customer_notes
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_notes_admin_all" ON public.customer_notes;
CREATE POLICY "customer_notes_admin_all"
  ON public.customer_notes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- customer_tags
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_tags_admin_all" ON public.customer_tags;
CREATE POLICY "customer_tags_admin_all"
  ON public.customer_tags FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- customer_tag_assignments
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_tag_assignments_admin_all" ON public.customer_tag_assignments;
CREATE POLICY "customer_tag_assignments_admin_all"
  ON public.customer_tag_assignments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- customer_loyalty_history
ALTER TABLE public.customer_loyalty_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_loyalty_history_admin_all" ON public.customer_loyalty_history;
CREATE POLICY "customer_loyalty_history_admin_all"
  ON public.customer_loyalty_history FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── 8. Verification ──────────────────────────────────────────────────────────

SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns c
   WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'customers',
    'customer_notes',
    'customer_tags',
    'customer_tag_assignments',
    'customer_loyalty_history'
  )
ORDER BY table_name;
