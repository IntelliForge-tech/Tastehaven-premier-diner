-- ============================================================================
-- TasteHaven Premier Diner — Initial Schema Migration
-- ============================================================================
-- Creates every table from the approved database architecture:
--   - Identity & access (admin_users)
--   - Menu system (menu_categories, menu_items, special_offers)
--   - Gallery system (gallery_categories, gallery_images)
--   - Testimonials, chefs, faqs
--   - Reservation system (reservations, reservation_status_log)
--   - Site settings (hero, about, restaurant_info, opening_hours,
--     social_links, footer, seo)
--
-- Explicitly OUT OF SCOPE for this migration (by design, per project phase):
--   - Row Level Security policies
--   - Storage buckets
--   - Edge Functions
--   - Triggers (including updated_at auto-touch)
--   - Seed data
-- ============================================================================

-- Ensure gen_random_uuid() is available (Supabase projects normally already
-- have pgcrypto enabled, but this makes the migration self-contained).
create extension if not exists pgcrypto;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

create type public.admin_role as enum ('owner', 'staff');

comment on type public.admin_role is
  'Role granted to an admin_users row. Single-owner model today; staff is reserved for future multi-user access.';

create type public.reservation_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

comment on type public.reservation_status is
  'Lifecycle of a table reservation: pending (submitted, unreviewed) -> confirmed (owner acknowledged) -> completed (fulfilled), with cancelled/no_show as terminal branches from pending or confirmed.';

-- ============================================================================
-- IDENTITY & ACCESS
-- ============================================================================

create table public.admin_users (
  id            uuid primary key references auth.users (id) on delete cascade,
  full_name     text not null,
  role          public.admin_role not null default 'owner',
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.admin_users is
  'App-specific profile data extending Supabase auth.users. One-to-one with auth.users; never duplicates credentials.';
comment on column public.admin_users.id is 'FK to auth.users.id, also this table''s primary key (1:1).';
comment on column public.admin_users.role is 'owner or staff — see admin_role enum.';
comment on column public.admin_users.is_active is 'Lets the owner disable a staff account without deleting the underlying auth user.';

-- ============================================================================
-- MENU SYSTEM
-- ============================================================================

create table public.menu_categories (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null,
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint menu_categories_name_unique unique (name),
  constraint menu_categories_slug_unique unique (slug)
);

comment on table public.menu_categories is
  'Owner-editable replacement for the previously hardcoded Category union type.';
comment on column public.menu_categories.slug is 'URL/filter-friendly identifier, derived from name.';

create index menu_categories_display_order_idx on public.menu_categories (display_order);

create table public.menu_items (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid not null references public.menu_categories (id) on delete restrict,
  name            text not null,
  description     text,
  price           numeric(10, 2) not null,
  rating          numeric(2, 1),
  image_url       text,
  is_available    boolean not null default true,
  is_featured     boolean not null default false,
  display_order   integer not null default 0,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint menu_items_price_positive check (price > 0),
  constraint menu_items_rating_range check (rating is null or (rating >= 0 and rating <= 5))
);

comment on table public.menu_items is
  'Individual dishes. Replaces the static DISHES array. Soft-deletable so seasonal removals keep price/photo history.';
comment on column public.menu_items.deleted_at is 'Soft delete marker. NULL means active/visible to admin tooling.';
comment on column public.menu_items.category_id is 'A dish belongs to exactly one category (matches existing single-value Category field).';

create index menu_items_category_id_idx on public.menu_items (category_id);
create index menu_items_is_featured_idx on public.menu_items (is_featured);

create table public.special_offers (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text,
  tag             text,
  icon            text,
  valid_from      date,
  valid_until     date,
  is_active       boolean not null default true,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint special_offers_date_range check (
    valid_from is null or valid_until is null or valid_until >= valid_from
  )
);

comment on table public.special_offers is
  'Promotional offers. Standalone — not linked to specific menu items in the current design.';

create index special_offers_is_active_idx on public.special_offers (is_active);

-- ============================================================================
-- GALLERY SYSTEM
-- ============================================================================

create table public.gallery_categories (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  display_order   integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint gallery_categories_name_unique unique (name)
);

comment on table public.gallery_categories is
  'Owner-editable gallery groupings (e.g. Interior, Events, Ambience).';

create table public.gallery_images (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid references public.gallery_categories (id) on delete set null,
  image_url       text not null,
  alt_text        text not null,
  caption         text,
  is_featured     boolean not null default false,
  display_order   integer not null default 0,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.gallery_images is
  'Replaces the static gallery data array. Soft-deletable to protect caption/alt-text authoring effort.';
comment on column public.gallery_images.alt_text is
  'Required (not optional) — accessibility and SEO baseline, an upgrade over the current frontend which has none.';
comment on column public.gallery_images.category_id is
  'Nullable: an image may be uncategorized.';

create index gallery_images_category_id_idx on public.gallery_images (category_id);
create index gallery_images_is_featured_idx on public.gallery_images (is_featured);

-- ============================================================================
-- TESTIMONIALS
-- ============================================================================

create table public.testimonials (
  id                  uuid primary key default gen_random_uuid(),
  customer_name       text not null,
  role_or_location    text,
  rating              integer not null,
  review_text         text not null,
  is_featured         boolean not null default false,
  is_visible          boolean not null default true,
  display_order       integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint testimonials_rating_range check (rating between 1 and 5)
);

comment on table public.testimonials is
  'Customer testimonials. is_visible lets the owner hide a genuine review without deleting it; no soft delete needed beyond that.';

create index testimonials_is_visible_idx on public.testimonials (is_visible);
create index testimonials_is_featured_idx on public.testimonials (is_featured);

-- ============================================================================
-- CHEFS
-- ============================================================================

create table public.chefs (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  position            text not null,
  bio                 text,
  years_experience    integer,
  image_url           text,
  social_links        jsonb not null default '{}'::jsonb,
  is_active           boolean not null default true,
  display_order       integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint chefs_years_experience_nonnegative check (
    years_experience is null or years_experience >= 0
  )
);

comment on table public.chefs is
  'Chef profiles. Replaces the static chefs data array.';
comment on column public.chefs.social_links is
  'Small, per-chef, never-filtered key/value map (e.g. instagram, twitter) — the one deliberate jsonb column in this schema, distinct from the relational social_links table which drives shared site-wide UI.';

create index chefs_display_order_idx on public.chefs (display_order);

-- ============================================================================
-- FAQ
-- ============================================================================

create table public.faqs (
  id              uuid primary key default gen_random_uuid(),
  question        text not null,
  answer          text not null,
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table public.faqs is
  'Frequently asked questions, currently rendered from a static array on the live site.';

create index faqs_is_active_idx on public.faqs (is_active);

-- ============================================================================
-- RESERVATION SYSTEM
-- ============================================================================

create table public.reservations (
  id                    uuid primary key default gen_random_uuid(),
  customer_name         text not null,
  email                 text not null,
  phone                 text not null,
  party_size            integer not null,
  reservation_date      date not null,
  reservation_time      time not null,
  special_request       text,
  status                public.reservation_status not null default 'pending',
  admin_notes           text,
  confirmed_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint reservations_customer_name_length check (char_length(customer_name) <= 80),
  constraint reservations_special_request_length check (
    special_request is null or char_length(special_request) <= 500
  ),
  constraint reservations_party_size_range check (party_size between 1 and 30)
);

comment on table public.reservations is
  'Table reservation requests. Replaces the previous client-only, non-persisted form. Field length/range constraints mirror existing frontend validation.';
comment on column public.reservations.admin_notes is 'Internal-only notes, never exposed to the customer.';
comment on column public.reservations.confirmed_at is 'Set when status transitions to confirmed.';

create index reservations_reservation_date_idx on public.reservations (reservation_date);
create index reservations_status_idx on public.reservations (status);

create table public.reservation_status_log (
  id                  uuid primary key default gen_random_uuid(),
  reservation_id      uuid not null references public.reservations (id) on delete cascade,
  previous_status     public.reservation_status,
  new_status          public.reservation_status not null,
  changed_by          uuid not null references public.admin_users (id) on delete restrict,
  changed_at          timestamptz not null default now()
);

comment on table public.reservation_status_log is
  'Audit trail of reservation status changes — supports operational disputes ("who confirmed this and when") that a bare status column cannot answer.';
comment on column public.reservation_status_log.previous_status is 'NULL for the initial insert row.';

create index reservation_status_log_reservation_id_idx on public.reservation_status_log (reservation_id);

-- ============================================================================
-- SITE SETTINGS — SINGLETONS
-- ============================================================================
-- Each singleton table is constrained to exactly one row via a fixed,
-- known primary key value plus a CHECK constraint enforcing it.

create table public.hero_settings (
  id                        uuid primary key default '00000000-0000-0000-0000-000000000001',
  headline                  text not null,
  subheadline               text,
  cta_text                  text,
  cta_link                  text,
  background_image_url      text,
  updated_at                timestamptz not null default now(),
  constraint hero_settings_singleton check (id = '00000000-0000-0000-0000-000000000001')
);

comment on table public.hero_settings is
  'Singleton: homepage hero content. Enforced to a single row via fixed id + check constraint.';

create table public.about_settings (
  id              uuid primary key default '00000000-0000-0000-0000-000000000002',
  headline        text not null,
  description     text,
  image_url       text,
  features        jsonb not null default '[]'::jsonb,
  updated_at      timestamptz not null default now(),
  constraint about_settings_singleton check (id = '00000000-0000-0000-0000-000000000002')
);

comment on table public.about_settings is
  'Singleton: About section content.';
comment on column public.about_settings.features is
  'Small, order-fixed, non-queried list of {icon, title, description} objects — matches the existing IconFeature type.';

create table public.restaurant_info (
  id              uuid primary key default '00000000-0000-0000-0000-000000000003',
  name            text not null,
  tagline         text,
  description     text,
  address         text,
  phone           text,
  email           text,
  logo_url        text,
  updated_at      timestamptz not null default now(),
  constraint restaurant_info_singleton check (id = '00000000-0000-0000-0000-000000000003')
);

comment on table public.restaurant_info is
  'Singleton: core restaurant identity/contact details, the source of truth other sections read from rather than duplicating.';

create table public.footer_settings (
  id                  uuid primary key default '00000000-0000-0000-0000-000000000004',
  copyright_text      text,
  tagline             text,
  updated_at          timestamptz not null default now(),
  constraint footer_settings_singleton check (id = '00000000-0000-0000-0000-000000000004')
);

comment on table public.footer_settings is
  'Singleton: footer copy. Deliberately thin — quick links derive from menu_categories, social icons come from social_links.';

-- ============================================================================
-- SITE SETTINGS — COLLECTIONS (not singletons)
-- ============================================================================

create table public.opening_hours (
  id              uuid primary key default gen_random_uuid(),
  day_of_week     integer not null,
  open_time       time,
  close_time      time,
  is_closed       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint opening_hours_day_of_week_unique unique (day_of_week),
  constraint opening_hours_day_of_week_range check (day_of_week between 0 and 6),
  constraint opening_hours_times_or_closed check (
    is_closed = true or (open_time is not null and close_time is not null)
  )
);

comment on table public.opening_hours is
  'Exactly one row per day of week (0-6). Not a singleton despite being listed alongside other "settings" — a weekly schedule is inherently a 7-row collection.';

create table public.social_links (
  id              uuid primary key default gen_random_uuid(),
  platform        text not null,
  url             text not null,
  icon            text,
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint social_links_platform_unique unique (platform)
);

comment on table public.social_links is
  'Shared social link collection, referenced conceptually by both the Contact section and the Footer to avoid duplicating the same data in two settings tables.';

create index social_links_is_active_idx on public.social_links (is_active);

create table public.seo_settings (
  id                    uuid primary key default gen_random_uuid(),
  page_identifier       text not null,
  meta_title            text not null,
  meta_description      text not null,
  keywords              text[],
  og_image_url          text,
  canonical_url         text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint seo_settings_page_identifier_unique unique (page_identifier)
);

comment on table public.seo_settings is
  'Per-page SEO metadata. Modeled as a keyed collection (page_identifier) rather than a singleton so per-page SEO can be added later with zero migration — today only a single "home" row is expected.';

create index seo_settings_page_identifier_idx on public.seo_settings (page_identifier);
