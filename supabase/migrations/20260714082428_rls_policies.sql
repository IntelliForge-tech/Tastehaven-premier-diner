-- ============================================================================
-- TasteHaven Premier Diner — Row Level Security Migration
-- ============================================================================
-- Enables RLS on every table created in the initial schema migration and
-- defines all access policies.
--
-- Access pattern used throughout:
--   - Public content tables: SELECT open to everyone (filtered to
--     published/active/visible rows), all writes admin-only.
--   - reservations: the sole exception — public INSERT only, no public
--     SELECT/UPDATE/DELETE at all.
--   - reservation_status_log: fully admin-only, no public access.
--   - admin_users: a user may only read/update their own row.
--
-- Explicitly OUT OF SCOPE for this migration (per project phase):
--   - Storage buckets and storage policies
--   - Edge Functions
--   - Triggers unrelated to auth
--   - Seed data
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION
-- ============================================================================
-- Centralizes the "is the current caller an active admin?" check so every
-- policy below reads the same way. SECURITY DEFINER is required here: RLS
-- on admin_users itself only lets a user read their own row, which would
-- make this function unable to see other admins' rows if it ran as the
-- caller. Running as the function owner (definer) bypasses that RLS just
-- for this narrow, read-only check, without exposing admin_users data
-- directly to callers.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and is_active = true
  );
$$;

comment on function public.is_admin() is
  'Returns true if the currently authenticated user (auth.uid()) has an active row in admin_users. SECURITY DEFINER so it can see all admin_users rows regardless of that table''s own RLS.';

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY — every table
-- ============================================================================

alter table public.admin_users             enable row level security;
alter table public.menu_categories          enable row level security;
alter table public.menu_items               enable row level security;
alter table public.special_offers           enable row level security;
alter table public.gallery_categories       enable row level security;
alter table public.gallery_images           enable row level security;
alter table public.testimonials             enable row level security;
alter table public.chefs                    enable row level security;
alter table public.faqs                     enable row level security;
alter table public.reservations             enable row level security;
alter table public.reservation_status_log   enable row level security;
alter table public.hero_settings            enable row level security;
alter table public.about_settings           enable row level security;
alter table public.restaurant_info          enable row level security;
alter table public.footer_settings          enable row level security;
alter table public.opening_hours            enable row level security;
alter table public.social_links             enable row level security;
alter table public.seo_settings             enable row level security;

-- ============================================================================
-- ADMIN_USERS — self-access only, no admin-wide bypass
-- ============================================================================
-- Deliberately NOT using is_admin() here: an admin should be able to see
-- their own profile even before any admin_users row exists to bootstrap
-- from, and one admin should not be able to browse other admins' profiles
-- through this table. Row creation is out of scope for this migration
-- (handled by a separate signup flow), so no INSERT policy is defined.

create policy admin_users_select_own
  on public.admin_users
  for select
  to authenticated
  using (id = auth.uid());

create policy admin_users_update_own
  on public.admin_users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ============================================================================
-- MENU CATEGORIES
-- ============================================================================

create policy menu_categories_select_public
  on public.menu_categories
  for select
  to anon, authenticated
  using (is_active = true);

create policy menu_categories_admin_all
  on public.menu_categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- MENU ITEMS
-- ============================================================================

create policy menu_items_select_public
  on public.menu_items
  for select
  to anon, authenticated
  using (is_available = true and deleted_at is null);

create policy menu_items_admin_all
  on public.menu_items
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- SPECIAL OFFERS
-- ============================================================================

create policy special_offers_select_public
  on public.special_offers
  for select
  to anon, authenticated
  using (is_active = true);

create policy special_offers_admin_all
  on public.special_offers
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- GALLERY CATEGORIES
-- ============================================================================
-- No is_active flag on this table by design (see schema migration), so
-- public read is unconditional.

create policy gallery_categories_select_public
  on public.gallery_categories
  for select
  to anon, authenticated
  using (true);

create policy gallery_categories_admin_all
  on public.gallery_categories
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- GALLERY IMAGES
-- ============================================================================

create policy gallery_images_select_public
  on public.gallery_images
  for select
  to anon, authenticated
  using (deleted_at is null);

create policy gallery_images_admin_all
  on public.gallery_images
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================

create policy testimonials_select_public
  on public.testimonials
  for select
  to anon, authenticated
  using (is_visible = true);

create policy testimonials_admin_all
  on public.testimonials
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- CHEFS
-- ============================================================================

create policy chefs_select_public
  on public.chefs
  for select
  to anon, authenticated
  using (is_active = true);

create policy chefs_admin_all
  on public.chefs
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- FAQS
-- ============================================================================

create policy faqs_select_public
  on public.faqs
  for select
  to anon, authenticated
  using (is_active = true);

create policy faqs_admin_all
  on public.faqs
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- RESERVATIONS — public INSERT only, admin-only everything else
-- ============================================================================
-- No public select policy is defined at all: an anonymous customer can
-- create a reservation but cannot read it back (matches the approved
-- architecture — customer-facing reservation lookup would require a
-- customer-accounts feature, which is out of scope today).

create policy reservations_insert_public
  on public.reservations
  for insert
  to anon, authenticated
  with check (true);

create policy reservations_select_admin
  on public.reservations
  for select
  to authenticated
  using (public.is_admin());

create policy reservations_update_admin
  on public.reservations
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy reservations_delete_admin
  on public.reservations
  for delete
  to authenticated
  using (public.is_admin());

-- ============================================================================
-- RESERVATION STATUS LOG — fully admin-only
-- ============================================================================

create policy reservation_status_log_select_admin
  on public.reservation_status_log
  for select
  to authenticated
  using (public.is_admin());

create policy reservation_status_log_insert_admin
  on public.reservation_status_log
  for insert
  to authenticated
  with check (public.is_admin() and changed_by = auth.uid());

-- ============================================================================
-- SETTINGS TABLES (SINGLETONS) — public read, admin write
-- ============================================================================

create policy hero_settings_select_public
  on public.hero_settings
  for select
  to anon, authenticated
  using (true);

create policy hero_settings_admin_all
  on public.hero_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy about_settings_select_public
  on public.about_settings
  for select
  to anon, authenticated
  using (true);

create policy about_settings_admin_all
  on public.about_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy restaurant_info_select_public
  on public.restaurant_info
  for select
  to anon, authenticated
  using (true);

create policy restaurant_info_admin_all
  on public.restaurant_info
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy footer_settings_select_public
  on public.footer_settings
  for select
  to anon, authenticated
  using (true);

create policy footer_settings_admin_all
  on public.footer_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- OPENING HOURS (collection, not a singleton) — public read, admin write
-- ============================================================================

create policy opening_hours_select_public
  on public.opening_hours
  for select
  to anon, authenticated
  using (true);

create policy opening_hours_admin_all
  on public.opening_hours
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- SOCIAL LINKS (collection, not a singleton) — public read, admin write
-- ============================================================================

create policy social_links_select_public
  on public.social_links
  for select
  to anon, authenticated
  using (is_active = true);

create policy social_links_admin_all
  on public.social_links
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================================
-- SEO SETTINGS — public read, admin write
-- ============================================================================

create policy seo_settings_select_public
  on public.seo_settings
  for select
  to anon, authenticated
  using (true);

create policy seo_settings_admin_all
  on public.seo_settings
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
