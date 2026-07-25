-- Phase 13A — Advanced Reservation Management System
-- Adds new tables and extends the reservations table.
-- All operations are idempotent and safe to run multiple times.

-- ─── 1. Extend reservations table ────────────────────────────────────────────

ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS table_number     TEXT,
  ADD COLUMN IF NOT EXISTS checked_in_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS seated_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS no_show_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS staff_notes     TEXT,
  ADD COLUMN IF NOT EXISTS tags            TEXT[],
  ADD COLUMN IF NOT EXISTS source          TEXT NOT NULL DEFAULT 'website';

-- Extend the existing DB status enum by adding new values.
-- Postgres requires ALTER TYPE for enums.
-- Wrapped in DO blocks so it is safe to run multiple times.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.reservation_status'::regtype
      AND enumlabel = 'checked_in'
  ) THEN
    ALTER TYPE public.reservation_status ADD VALUE 'checked_in';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = 'public.reservation_status'::regtype
      AND enumlabel = 'seated'
  ) THEN
    ALTER TYPE public.reservation_status ADD VALUE 'seated';
  END IF;
END $$;

-- ─── 2. Create reservation_notes table ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reservation_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id  UUID NOT NULL REFERENCES public.reservations(id) ON DELETE CASCADE,
  note            TEXT NOT NULL,
  created_by      UUID NOT NULL REFERENCES public.admin_users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservation_notes_reservation_id
  ON public.reservation_notes(reservation_id);

-- ─── 3. Create reservation_status_history view (alias of existing log) ────────
-- reservation_status_log already exists; we add an alias view for the new
-- service so the service layer can use either name cleanly.

-- No action needed — service reads from reservation_status_log directly.

-- ─── 4. RLS — reservation_notes ──────────────────────────────────────────────

DROP POLICY IF EXISTS "reservation_notes_admin_all" ON public.reservation_notes;
CREATE POLICY "reservation_notes_admin_all"
  ON public.reservation_notes FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

ALTER TABLE public.reservation_notes ENABLE ROW LEVEL SECURITY;

-- ─── 5. RLS — ensure reservations RLS is consistent ─────────────────────────

DROP POLICY IF EXISTS "reservations_admin_all" ON public.reservations;
CREATE POLICY "reservations_admin_all"
  ON public.reservations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reservations_public_insert" ON public.reservations;
CREATE POLICY "reservations_public_insert"
  ON public.reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
