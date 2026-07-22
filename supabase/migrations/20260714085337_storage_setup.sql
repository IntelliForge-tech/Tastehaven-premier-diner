-- ============================================================================
-- TasteHaven Premier Diner — Storage Migration
-- ============================================================================
-- Creates the Storage bucket(s) and their access policies.
--
-- BUCKET STRATEGY: ONE public bucket ("restaurant-media"), not several.
--
-- Why one bucket, not one-per-content-type (menu/gallery/chefs/hero/about):
--   - Every image in this project shares the identical access rule: public
--     read, admin-only write. Buckets are the unit Supabase RLS separates
--     by access policy, not by content category — when every category
--     needs the same policy, splitting by bucket only multiplies the
--     number of near-identical policies to maintain with no security
--     benefit.
--   - Content-type separation is still preserved — just at the folder
--     level within the one bucket (restaurant-media/menu-items/,
--     /gallery/, /chefs/, /hero/, /about/), which keeps the admin
--     dashboard's upload UI and storage browsing just as organized,
--     without needing per-bucket policy duplication.
--   - Nothing in the current feature set needs a private bucket: there is
--     no customer-uploaded content and no per-user file access. If that
--     changes later (e.g. customer profile photos), that is the point at
--     which a second, private bucket with its own distinct policies would
--     be introduced — not before.
--
-- Explicitly OUT OF SCOPE for this migration (per project phase):
--   - Application/upload code
--   - Edge Functions
--   - Additional buckets beyond the one needed today
-- ============================================================================

-- ============================================================================
-- BUCKET
-- ============================================================================
-- public = true → objects are readable via their public URL with no signed
-- URL required, matching how the frontend already references images today
-- (direct <img src> URLs). file_size_limit and allowed_mime_types are set
-- defensively so the bucket only ever holds what it's meant for: web-sized
-- marketing images, not arbitrary file uploads.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-media',
  'restaurant-media',
  true,
  5242880, -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- ============================================================================
-- STORAGE POLICIES — storage.objects
-- ============================================================================
-- storage.objects already has RLS enabled by default on every Supabase
-- project; this migration only adds policies scoped to this bucket, it
-- does not alter RLS on any other bucket's objects.
--
-- Access pattern mirrors every content table from the RLS migration:
-- public SELECT, admin-only INSERT/UPDATE/DELETE, using the same
-- public.is_admin() helper function already defined for the database
-- tables — so "who counts as an admin" is defined in exactly one place
-- across the whole project.

create policy restaurant_media_select_public
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'restaurant-media');

create policy restaurant_media_insert_admin
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'restaurant-media'
    and public.is_admin()
  );

create policy restaurant_media_update_admin
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'restaurant-media'
    and public.is_admin()
  )
  with check (
    bucket_id = 'restaurant-media'
    and public.is_admin()
  );

create policy restaurant_media_delete_admin
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'restaurant-media'
    and public.is_admin()
  );
