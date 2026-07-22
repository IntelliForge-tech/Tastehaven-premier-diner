-- ============================================================================
-- ONE-TIME BOOTSTRAP SCRIPT — first admin_users row, found by email.
-- Run once, manually, via the Supabase SQL Editor or a direct postgres-role
-- connection (bypasses RLS the same way migrations do). Not a migration.
-- Safe to re-run: no-ops if the row already exists.
-- No enum, schema, or table changes. Uses the existing 'owner' admin_role.
-- ============================================================================

-- Replace REPLACE_WITH_ADMIN_EMAIL with the real email before running.
insert into public.admin_users (id, full_name, role, is_active)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.email) as full_name,
  'owner'::public.admin_role,
  true
from auth.users u
where u.email = 'ashwanichauhan7523@gmail.com'
on conflict (id) do nothing;

-- Verification: expect exactly one row, matching the email used above.
select id, full_name, role, is_active
from public.admin_users
where role = 'owner';
