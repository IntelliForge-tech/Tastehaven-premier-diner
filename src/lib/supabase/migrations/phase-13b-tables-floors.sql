-- ============================================================
-- Phase 13B — Table & Floor Management System
-- Run in Supabase SQL Editor or via supabase db push
-- ============================================================

-- ── 1. floors ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.floors (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  display_order    INTEGER NOT NULL DEFAULT 0,
  max_capacity     INTEGER,
  background_image TEXT,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.floors
  ADD COLUMN IF NOT EXISTS description      TEXT,
  ADD COLUMN IF NOT EXISTS display_order    INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_capacity     INTEGER,
  ADD COLUMN IF NOT EXISTS background_image TEXT,
  ADD COLUMN IF NOT EXISTS is_active        BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.floors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "floors_public_read" ON public.floors;
CREATE POLICY "floors_public_read"
  ON public.floors FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "floors_admin_write" ON public.floors;
CREATE POLICY "floors_admin_write"
  ON public.floors FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed default floors
INSERT INTO public.floors (name, description, display_order, is_active)
VALUES
  ('Ground Floor', 'Main dining area', 0, TRUE),
  ('First Floor',  'Upper dining area', 1, TRUE),
  ('Terrace',      'Outdoor seating',  2, TRUE)
ON CONFLICT DO NOTHING;

-- ── 2. restaurant_tables ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id     UUID NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  table_name   TEXT,
  capacity     INTEGER NOT NULL DEFAULT 4,
  min_guests   INTEGER,
  max_guests   INTEGER,
  shape        TEXT NOT NULL DEFAULT 'square'
                 CHECK (shape IN ('square','rectangle','circle','oval','booth','custom')),
  status       TEXT NOT NULL DEFAULT 'available'
                 CHECK (status IN ('available','reserved','occupied','cleaning','maintenance','disabled','merge_pending')),
  position_x   INTEGER NOT NULL DEFAULT 50,
  position_y   INTEGER NOT NULL DEFAULT 50,
  rotation     INTEGER NOT NULL DEFAULT 0,
  notes        TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.restaurant_tables
  ADD COLUMN IF NOT EXISTS table_name TEXT,
  ADD COLUMN IF NOT EXISTS min_guests INTEGER,
  ADD COLUMN IF NOT EXISTS max_guests INTEGER,
  ADD COLUMN IF NOT EXISTS position_x INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS position_y INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS rotation   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes      TEXT,
  ADD COLUMN IF NOT EXISTS is_active  BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "restaurant_tables_public_read" ON public.restaurant_tables;
CREATE POLICY "restaurant_tables_public_read"
  ON public.restaurant_tables FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "restaurant_tables_admin_write" ON public.restaurant_tables;
CREATE POLICY "restaurant_tables_admin_write"
  ON public.restaurant_tables FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 3. table_assignments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.table_assignments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL,
  table_id       UUID NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE,
  assigned_by    TEXT,
  assigned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at    TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active','released','cancelled'))
);

ALTER TABLE public.table_assignments
  ADD COLUMN IF NOT EXISTS assigned_by TEXT,
  ADD COLUMN IF NOT EXISTS released_at TIMESTAMPTZ;

ALTER TABLE public.table_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "table_assignments_admin_all" ON public.table_assignments;
CREATE POLICY "table_assignments_admin_all"
  ON public.table_assignments FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 4. table_merge_groups ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.table_merge_groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.table_merge_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "table_merge_groups_admin_all" ON public.table_merge_groups;
CREATE POLICY "table_merge_groups_admin_all"
  ON public.table_merge_groups FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 5. table_merge_items ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.table_merge_items (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.table_merge_groups(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES public.restaurant_tables(id) ON DELETE CASCADE
);

ALTER TABLE public.table_merge_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "table_merge_items_admin_all" ON public.table_merge_items;
CREATE POLICY "table_merge_items_admin_all"
  ON public.table_merge_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 6. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_floor_id ON public.restaurant_tables(floor_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_status   ON public.restaurant_tables(status);
CREATE INDEX IF NOT EXISTS idx_table_assignments_table_id ON public.table_assignments(table_id);
CREATE INDEX IF NOT EXISTS idx_table_assignments_status   ON public.table_assignments(status);
CREATE INDEX IF NOT EXISTS idx_table_merge_items_group_id ON public.table_merge_items(group_id);
