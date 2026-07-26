-- ============================================================
-- Phase 13D — Staff Management & Employee Administration System
-- Run in Supabase SQL Editor or via supabase db push
-- ============================================================

-- ── 1. staff_departments ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_departments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  department_head TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_departments
  ADD COLUMN IF NOT EXISTS description     TEXT,
  ADD COLUMN IF NOT EXISTS department_head TEXT,
  ADD COLUMN IF NOT EXISTS display_order   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active       BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.staff_departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_departments_admin_all" ON public.staff_departments;
CREATE POLICY "staff_departments_admin_all"
  ON public.staff_departments FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed default departments
INSERT INTO public.staff_departments (name, display_order, is_active)
VALUES
  ('Kitchen',     0, TRUE), ('Reception',  1, TRUE), ('Management', 2, TRUE),
  ('Bar',         3, TRUE), ('Service',    4, TRUE), ('Finance',    5, TRUE),
  ('HR',          6, TRUE), ('Marketing',  7, TRUE), ('IT',         8, TRUE)
ON CONFLICT DO NOTHING;

-- ── 2. staff_designations ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_designations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  department_id UUID REFERENCES public.staff_departments(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_designations
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.staff_departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.staff_designations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_designations_admin_all" ON public.staff_designations;
CREATE POLICY "staff_designations_admin_all"
  ON public.staff_designations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed default designations
INSERT INTO public.staff_designations (title, is_active)
VALUES
  ('Owner', TRUE), ('General Manager', TRUE), ('Restaurant Manager', TRUE),
  ('Assistant Manager', TRUE), ('Head Chef', TRUE), ('Sous Chef', TRUE),
  ('Chef', TRUE), ('Receptionist', TRUE), ('Cashier', TRUE),
  ('Bartender', TRUE), ('Waiter', TRUE), ('Cleaner', TRUE),
  ('Security', TRUE), ('Accountant', TRUE), ('Marketing Executive', TRUE)
ON CONFLICT DO NOTHING;

-- ── 3. staff_shifts ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_shifts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  start_time     TEXT NOT NULL,
  end_time       TEXT NOT NULL,
  break_minutes  INTEGER NOT NULL DEFAULT 30,
  working_hours  NUMERIC(4,1) NOT NULL DEFAULT 8,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_shifts
  ADD COLUMN IF NOT EXISTS break_minutes INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS working_hours NUMERIC(4,1) NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS is_active     BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_shifts_admin_all" ON public.staff_shifts;
CREATE POLICY "staff_shifts_admin_all"
  ON public.staff_shifts FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Seed default shifts
INSERT INTO public.staff_shifts (name, start_time, end_time, break_minutes, working_hours, is_active)
VALUES
  ('Morning Shift',   '06:00', '14:00', 30, 7.5, TRUE),
  ('Afternoon Shift', '14:00', '22:00', 30, 7.5, TRUE),
  ('Evening Shift',   '18:00', '02:00', 30, 7.5, TRUE),
  ('Night Shift',     '22:00', '06:00', 30, 7.5, TRUE)
ON CONFLICT DO NOTHING;

-- ── 4. staff_members ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id         TEXT NOT NULL UNIQUE,
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  date_of_birth       DATE,
  gender              TEXT,
  address             TEXT,
  city                TEXT,
  country             TEXT,
  emergency_contact   TEXT,
  emergency_phone     TEXT,
  joining_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  employment_status   TEXT NOT NULL DEFAULT 'active'
                        CHECK (employment_status IN ('active','inactive','on_leave','suspended','resigned','terminated','probation','retired')),
  department_id       UUID REFERENCES public.staff_departments(id) ON DELETE SET NULL,
  designation_id      UUID REFERENCES public.staff_designations(id) ON DELETE SET NULL,
  shift_id            UUID REFERENCES public.staff_shifts(id) ON DELETE SET NULL,
  manager_id          UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  salary              NUMERIC(12,2),
  notes               TEXT,
  profile_photo_url   TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_members
  ADD COLUMN IF NOT EXISTS phone             TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth     DATE,
  ADD COLUMN IF NOT EXISTS gender            TEXT,
  ADD COLUMN IF NOT EXISTS address           TEXT,
  ADD COLUMN IF NOT EXISTS city              TEXT,
  ADD COLUMN IF NOT EXISTS country           TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS emergency_phone   TEXT,
  ADD COLUMN IF NOT EXISTS department_id     UUID REFERENCES public.staff_departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS designation_id    UUID REFERENCES public.staff_designations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS shift_id          UUID REFERENCES public.staff_shifts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS manager_id        UUID REFERENCES public.staff_members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS salary            NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS notes             TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS is_active         BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_members_admin_all" ON public.staff_members;
CREATE POLICY "staff_members_admin_all"
  ON public.staff_members FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── 5. staff_attendance ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id  UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  attendance_date  DATE NOT NULL,
  check_in         TEXT,
  check_out        TEXT,
  working_hours    NUMERIC(4,1),
  status           TEXT NOT NULL DEFAULT 'present'
                     CHECK (status IN ('present','absent','late','half_day','overtime','on_leave')),
  late_minutes     INTEGER NOT NULL DEFAULT 0,
  overtime_minutes INTEGER NOT NULL DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (staff_member_id, attendance_date)
);

ALTER TABLE public.staff_attendance
  ADD COLUMN IF NOT EXISTS check_in         TEXT,
  ADD COLUMN IF NOT EXISTS check_out        TEXT,
  ADD COLUMN IF NOT EXISTS working_hours    NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS late_minutes     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS overtime_minutes INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes            TEXT;

ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_attendance_admin_all" ON public.staff_attendance;
CREATE POLICY "staff_attendance_admin_all"
  ON public.staff_attendance FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── 6. staff_leave_requests ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_leave_requests (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id  UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  leave_type       TEXT NOT NULL
                     CHECK (leave_type IN ('sick','casual','paid','emergency','maternity','paternity','vacation','unpaid')),
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  total_days       INTEGER NOT NULL DEFAULT 1,
  reason           TEXT,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','approved','rejected','cancelled')),
  approved_by      TEXT,
  approval_date    TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_leave_requests
  ADD COLUMN IF NOT EXISTS total_days       INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS approved_by      TEXT,
  ADD COLUMN IF NOT EXISTS approval_date    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.staff_leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_leave_requests_admin_all" ON public.staff_leave_requests;
CREATE POLICY "staff_leave_requests_admin_all"
  ON public.staff_leave_requests FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── 7. staff_performance ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_performance (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id       UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  review_period         TEXT NOT NULL CHECK (review_period IN ('monthly','quarterly','annual')),
  review_date           DATE NOT NULL,
  tasks_completed       INTEGER NOT NULL DEFAULT 0,
  customer_rating       NUMERIC(3,1),
  attendance_score      NUMERIC(5,2),
  punctuality_score     NUMERIC(5,2),
  overall_rating        NUMERIC(3,1) NOT NULL DEFAULT 0,
  manager_feedback      TEXT,
  achievements          TEXT,
  areas_for_improvement TEXT,
  warnings              INTEGER NOT NULL DEFAULT 0,
  awards                TEXT,
  training_completed    TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.staff_performance
  ADD COLUMN IF NOT EXISTS customer_rating      NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS attendance_score     NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS punctuality_score    NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS achievements         TEXT,
  ADD COLUMN IF NOT EXISTS areas_for_improvement TEXT,
  ADD COLUMN IF NOT EXISTS warnings             INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS awards               TEXT,
  ADD COLUMN IF NOT EXISTS training_completed   TEXT;

ALTER TABLE public.staff_performance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_performance_admin_all" ON public.staff_performance;
CREATE POLICY "staff_performance_admin_all"
  ON public.staff_performance FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── 8. Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_staff_members_dept         ON public.staff_members(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_status       ON public.staff_members(employment_status);
CREATE INDEX IF NOT EXISTS idx_staff_members_shift        ON public.staff_members(shift_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_member    ON public.staff_attendance(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date      ON public.staff_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_staff_leave_member         ON public.staff_leave_requests(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_leave_status         ON public.staff_leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_staff_performance_member   ON public.staff_performance(staff_member_id);
