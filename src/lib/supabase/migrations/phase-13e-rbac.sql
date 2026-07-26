-- Phase 13E — Role-Based Access Control (RBAC) & Permission Management
-- Designed for extensibility: adding a new module = one INSERT into permissions.
-- All operations are idempotent and safe to re-run.

-- ─── 1. Roles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  color         TEXT NOT NULL DEFAULT '#6b7280',
  icon          TEXT NOT NULL DEFAULT 'shield',
  priority      INTEGER NOT NULL DEFAULT 100,
  display_order INTEGER NOT NULL DEFAULT 100,
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Permission Groups (modules) ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.permission_groups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  description   TEXT,
  icon          TEXT NOT NULL DEFAULT 'layout',
  display_order INTEGER NOT NULL DEFAULT 100,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. Permissions ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.permissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id     UUID NOT NULL REFERENCES public.permission_groups(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. Role ↔ Permission join ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_by    UUID REFERENCES public.admin_users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id       ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);

-- ─── 5. Staff Role Assignments ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.staff_roles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id   UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  role_id         UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  is_primary      BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at      TIMESTAMPTZ,
  assigned_by     UUID REFERENCES public.admin_users(id),
  assigned_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (admin_user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_roles_admin_user_id ON public.staff_roles(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_staff_roles_role_id       ON public.staff_roles(role_id);

-- ─── 6. Permission Audit Log ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.permission_audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action          TEXT NOT NULL,
  actor_id        UUID REFERENCES public.admin_users(id),
  target_user_id  UUID REFERENCES public.admin_users(id),
  role_id         UUID REFERENCES public.roles(id),
  permission_id   UUID REFERENCES public.permissions(id),
  metadata        JSONB,
  ip_address      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permission_audit_logs_actor_id ON public.permission_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_permission_audit_logs_created_at ON public.permission_audit_logs(created_at DESC);

-- ─── 7. Seed: Permission Groups ──────────────────────────────────────────────

INSERT INTO public.permission_groups (id, name, slug, description, icon, display_order) VALUES
  ('00000000-aaaa-0000-0000-000000000001', 'Dashboard',             'dashboard',            'Main dashboard access',                         'layout-dashboard', 1),
  ('00000000-aaaa-0000-0000-000000000002', 'Reservations',          'reservations',         'Reservation management',                        'calendar-check',   2),
  ('00000000-aaaa-0000-0000-000000000003', 'Tables',                'tables',               'Table & floor management',                      'table',            3),
  ('00000000-aaaa-0000-0000-000000000004', 'Customers',             'customers',            'Customer CRM & loyalty',                        'users',            4),
  ('00000000-aaaa-0000-0000-000000000005', 'Staff',                 'staff',                'Staff management',                              'user-cog',         5),
  ('00000000-aaaa-0000-0000-000000000006', 'Menu',                  'menu',                 'Menu item management',                          'utensils',         6),
  ('00000000-aaaa-0000-0000-000000000007', 'Gallery',               'gallery',              'Gallery image management',                      'image',            7),
  ('00000000-aaaa-0000-0000-000000000008', 'Testimonials',          'testimonials',         'Customer testimonials',                         'quote',            8),
  ('00000000-aaaa-0000-0000-000000000009', 'Chefs',                 'chefs',                'Chef profiles',                                 'chef-hat',         9),
  ('00000000-aaaa-0000-0000-000000000010', 'Offers',                'offers',               'Special offers & promotions',                   'percent',          10),
  ('00000000-aaaa-0000-0000-000000000011', 'Content',               'content',              'CMS — Hero, About, Restaurant Info, Footer',    'layout-template',  11),
  ('00000000-aaaa-0000-0000-000000000012', 'Analytics',             'analytics',            'Reports & analytics',                           'bar-chart-3',      12),
  ('00000000-aaaa-0000-0000-000000000013', 'Settings',              'settings',             'Restaurant settings',                           'settings',         13),
  ('00000000-aaaa-0000-0000-000000000014', 'Access Control',        'access',               'RBAC roles & permissions',                      'shield',           14),
  ('00000000-aaaa-0000-0000-000000000015', 'Audit Logs',            'audit',                'System audit trail',                            'history',          15),
  ('00000000-aaaa-0000-0000-000000000016', 'Notifications',         'notifications',        'Notification management',                       'bell',             16),
  ('00000000-aaaa-0000-0000-000000000017', 'FAQ',                   'faq',                  'FAQ management',                                'help-circle',      17),
  ('00000000-aaaa-0000-0000-000000000018', 'Messages',              'messages',             'Contact messages',                              'mail',             18)
ON CONFLICT (id) DO NOTHING;

-- ─── 8. Seed: Permissions (view/create/edit/delete/export/manage per module) ──

-- Helper: insert permission with stable ID so future seeding is idempotent.
-- Pattern: 00000000-bbbb-0000-{group_order}-{perm_order}
-- group_order = 2-digit hex of group display_order, perm_order = 2-digit hex

DO $$
DECLARE
  groups RECORD;
  perms TEXT[][] := ARRAY[
    ARRAY['view',   'View'],
    ARRAY['create', 'Create'],
    ARRAY['edit',   'Edit'],
    ARRAY['delete', 'Delete'],
    ARRAY['export', 'Export'],
    ARRAY['manage', 'Manage']
  ];
  p TEXT[];
  perm_slug TEXT;
  perm_name TEXT;
BEGIN
  FOR groups IN SELECT id, slug, display_order FROM public.permission_groups LOOP
    FOREACH p SLICE 1 IN ARRAY perms LOOP
      perm_slug := groups.slug || '.' || p[1];
      perm_name := p[2];
      INSERT INTO public.permissions (group_id, name, slug, description)
      VALUES (groups.id, perm_name, perm_slug, perm_name || ' access for ' || groups.slug)
      ON CONFLICT (slug) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ─── 9. Seed: Default Roles ──────────────────────────────────────────────────

INSERT INTO public.roles (id, name, slug, description, color, icon, priority, display_order, is_system, is_active) VALUES
  ('00000000-cccc-0000-0000-000000000001', 'Owner',              'owner',              'Full system access. Cannot be deleted.',             '#d4af37', 'crown',          1,  1,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000002', 'General Manager',    'general-manager',    'Manage all restaurant operations.',                 '#7c3aed', 'shield',         2,  2,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000003', 'Restaurant Manager', 'restaurant-manager', 'Day-to-day restaurant management.',                 '#2563eb', 'building',       3,  3,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000004', 'Assistant Manager',  'assistant-manager',  'Assists the restaurant manager.',                   '#0891b2', 'user-check',     4,  4,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000005', 'Receptionist',       'receptionist',       'Handles reservations and customer greeting.',       '#16a34a', 'door-open',      5,  5,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000006', 'Cashier',            'cashier',            'Handles payments and transactions.',                '#ca8a04', 'credit-card',    6,  6,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000007', 'Head Chef',          'head-chef',          'Manages kitchen and menu planning.',                '#dc2626', 'chef-hat',       7,  7,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000008', 'Chef',               'chef',               'Kitchen staff — food preparation.',                 '#ea580c', 'utensils',       8,  8,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000009', 'Waiter',             'waiter',             'Table service staff.',                              '#0d9488', 'clipboard',      9,  9,  TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000010', 'Bartender',          'bartender',          'Bar and beverage service.',                         '#7c3aed', 'glass-water',    10, 10, TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000011', 'Kitchen Staff',      'kitchen-staff',      'General kitchen support.',                          '#b45309', 'flame',          11, 11, TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000012', 'Marketing Manager',  'marketing-manager',  'Manages promotions, social and content.',           '#db2777', 'megaphone',      12, 12, TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000013', 'Accountant',         'accountant',         'Financial reporting and accounts.',                 '#6b7280', 'calculator',     13, 13, TRUE,  TRUE),
  ('00000000-cccc-0000-0000-000000000014', 'Viewer',             'viewer',             'Read-only access. Cannot modify anything.',         '#9ca3af', 'eye',            99, 99, TRUE,  TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── 10. Seed: Owner role gets ALL permissions ────────────────────────────────

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-cccc-0000-0000-000000000001', id
FROM public.permissions
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── 11. Seed: Receptionist permissions ──────────────────────────────────────

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-cccc-0000-0000-000000000005', p.id
FROM public.permissions p
WHERE p.slug IN (
  'dashboard.view',
  'reservations.view', 'reservations.create', 'reservations.edit', 'reservations.manage',
  'customers.view', 'customers.create', 'customers.edit',
  'tables.view'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── 12. Seed: Chef permissions ───────────────────────────────────────────────

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-cccc-0000-0000-000000000008', p.id
FROM public.permissions p
WHERE p.slug IN (
  'dashboard.view',
  'reservations.view',
  'menu.view', 'menu.edit'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── 13. Seed: Viewer role gets only .view permissions ───────────────────────

INSERT INTO public.role_permissions (role_id, permission_id)
SELECT '00000000-cccc-0000-0000-000000000014', p.id
FROM public.permissions p
WHERE p.slug LIKE '%.view'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── 14. RLS ─────────────────────────────────────────────────────────────────

-- roles
DROP POLICY IF EXISTS "roles_admin_all" ON public.roles;
CREATE POLICY "roles_admin_all" ON public.roles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "roles_public_read" ON public.roles;
CREATE POLICY "roles_public_read" ON public.roles FOR SELECT TO anon USING (FALSE);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- permission_groups
DROP POLICY IF EXISTS "permission_groups_admin_all" ON public.permission_groups;
CREATE POLICY "permission_groups_admin_all" ON public.permission_groups FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.permission_groups ENABLE ROW LEVEL SECURITY;

-- permissions
DROP POLICY IF EXISTS "permissions_admin_all" ON public.permissions;
CREATE POLICY "permissions_admin_all" ON public.permissions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- role_permissions
DROP POLICY IF EXISTS "role_permissions_admin_all" ON public.role_permissions;
CREATE POLICY "role_permissions_admin_all" ON public.role_permissions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- staff_roles
DROP POLICY IF EXISTS "staff_roles_admin_all" ON public.staff_roles;
CREATE POLICY "staff_roles_admin_all" ON public.staff_roles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.staff_roles ENABLE ROW LEVEL SECURITY;

-- permission_audit_logs
DROP POLICY IF EXISTS "permission_audit_logs_admin_all" ON public.permission_audit_logs;
CREATE POLICY "permission_audit_logs_admin_all" ON public.permission_audit_logs FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.permission_audit_logs ENABLE ROW LEVEL SECURITY;
