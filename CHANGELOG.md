# CHANGELOG — Phase 7C: Gallery Edit / Replace / Delete

Scope: complete Gallery CRUD — edit page, image replacement with
cleanup, delete with confirmation. No categories, search, filters,
pagination, bulk delete, or restore — all explicitly later scope.

## UUID: switched to `uuidv4()` everywhere, as confirmed

Per your explicit confirmation that `uuid` is installed, both
`menu.service.ts` and `gallery.service.ts` now use `uuidv4()` from the
`uuid` package instead of `crypto.randomUUID()` — consistent with each
other, and matching this phase's spec. One honest caveat: `uuid` isn't
resolvable in *this sandbox* (confirmed — I tried `npm install uuid`
directly, npm's registry returned a 403 here), so `tsc` here shows
`Cannot find module 'uuid'` on both files. I temporarily shimmed the
module's types to verify everything *around* those two lines was
correct, then removed the shim (not part of this delivery). This is
expected in this sandbox and shouldn't occur in your environment where
`uuid` is actually installed — but it's the one thing about this
delivery I couldn't personally verify end-to-end. Please confirm
`npm run typecheck` is fully clean locally.

## Files Created (6)

- `src/hooks/useGalleryItem.ts` — fetch-by-id, mirrors `useMenuItem.ts`.
  Not explicitly named in the spec's hook list, but required by the
  Edit page's own "load gallery image by id" requirement — same
  supporting piece Menu's Edit page needed.
- `src/hooks/useUpdateGalleryItem.ts` — mirrors `useUpdateMenuItem.ts`,
  plus the rollback-on-failed-update behavior your spec explicitly
  required (see Architectural Decisions).
- `src/hooks/useDeleteGalleryItem.ts` — mirrors `useDeleteMenuItem.ts`
  exactly.
- `src/components/admin/gallery/DeleteGalleryImageDialog.tsx` — mirrors
  `DeleteMenuItemDialog.tsx`, shows the image's caption when one exists.
- `src/routes/admin/_authenticated/gallery/$imageId/edit.tsx` — mirrors
  `menu/$menuId/edit.tsx`.

## Files Modified (7)

- `src/services/gallery.service.ts` — added `getGalleryItemById()`,
  `updateGalleryItem()`, `deleteGalleryItem()` (soft delete via
  `deleted_at`); `GalleryServiceErrorCode` gained `"not_found"`;
  `mapPostgrestError`/`mapUnexpectedError` gained a `"delete"` context;
  switched to `uuidv4()`.
- `src/services/menu/menu.service.ts` — **one line changed**: switched
  to `uuidv4()`, matching Gallery. Nothing else in this file touched.
- `src/components/admin/gallery/gallery-item-schema.ts` — `imageFile`
  is now nullable/optional at the schema level (was: required via a
  refine) — see Architectural Decisions for why.
- `src/components/admin/gallery/GalleryForm.tsx` — now supports
  `mode="create"|"edit"`, `galleryItemId`, `defaultValues`,
  `existingImageUrl` props, mirroring `MenuForm.tsx`'s exact shape.
  `ImageFileInput` gained the same `existingImageUrl` fallback Menu's
  version has.
- `src/components/admin/gallery/GalleryCard.tsx` — Edit/Delete buttons
  switched from disabled placeholders (Phase 7A/7B) to real `onEdit`/
  `onDelete` callback props.
- `src/components/admin/gallery/GalleryGrid.tsx` — passes `onEdit`/
  `onDelete` through to each card.
- `src/routes/admin/_authenticated/gallery/index.tsx` — wired Edit
  (navigates to the new edit route) and Delete (opens
  `DeleteGalleryImageDialog`, refetches on success), mirroring
  `menu/index.tsx`'s Phase 6C additions. Confirmed no flat
  `gallery.tsx` exists anywhere in this tree, per your last message —
  it doesn't; only the `gallery/` directory.
- `src/routeTree.gen.ts` — hand-updated (same caveat as every phase:
  no native `@rolldown/binding-linux-x64-gnu` in this sandbox) to
  register `/admin/gallery/$imageId/edit`, following
  `menu/$menuId/edit`'s exact entry shape. **Please run `npm run dev`
  or `npm run build` locally to confirm it matches.**

## Architectural Decisions

1. **`imageFile` is nullable/optional at the schema level now, not
   required.** Gallery's *create* needs a required image
   (`image_url` is `NOT NULL`), but *edit* must allow keeping the
   existing image unchanged — same as Menu. One shared schema can't
   have two different required-ness rules for the same field depending
   on a runtime `mode` prop. Rather than fork `GalleryForm` into two
   components (which the spec explicitly forbids) or maintain two
   schemas, I made the field genuinely optional in the schema and
   enforce "required on create" imperatively via `form.setError()` in
   `GalleryForm`'s `onSubmit`. Same inline validation UX either way —
   just a different mechanism than the schema-level refine Phase 7B
   used, because Phase 7B never had this asymmetry to solve.
2. **`useUpdateGalleryItem` rolls back a failed update's newly-uploaded
   image — `useUpdateMenuItem` doesn't.** Your spec explicitly
   required this ("if database update fails, delete the newly
   uploaded image, keep the old image"). I checked: Menu's own update
   flow only cleans up the *old* image, and only *after* a *successful*
   save — it has no rollback path for a failed save. I didn't touch
   Menu to add one; that's already-shipped, working code and out of
   this phase's scope, but flagging it again since this is the third
   time this exact category of gap has come up between the two
   modules (create-failure cleanup in 7B, now update-failure rollback
   here) — worth considering a small dedicated pass to backport all of
   these to Menu at some point.
3. **Soft delete, not hard delete** — `deleteGalleryItem` stamps
   `deleted_at`, exactly matching `deleteMenuItem`'s approach and how
   `getGalleryItems()`/`getGalleryItemById()` already filter on that
   column.
4. **`useGalleryItem.ts` was added even though it's not in the spec's
   explicit hook list** — it's required by the Edit page's own stated
   requirement to "load gallery image by id," and is the same
   supporting piece Menu's Edit page already needed (`useMenuItem.ts`).

## Not Touched

`AdminLayout`, `Sidebar`/`nav-config.ts`, auth, `MenuForm.tsx`,
`useCreateMenuItem.ts`, `useUpdateMenuItem.ts`, `useDeleteMenuItem.ts`,
`DeleteMenuItemDialog.tsx`, or any other Menu file beyond the one-line
UUID change. `GalleryEmptyState.tsx`/`GallerySkeleton.tsx` (Phase 7A)
and `useGalleryItems.ts`/`useCreateGalleryItem.ts` (7A/7B) — unchanged.

## Assumptions Made

- `uuid` is genuinely installed in your environment, per your explicit
  confirmation — this delivery depends on that being true.
- No category field was added to the edit form, consistent with
  Phase 7B's create form (category wasn't in either phase's field
  list) and this phase's explicit "no categories" exclusion.
- `display_order` remains untouched by edit (same as create) — not a
  form field, no reordering logic, consistent with "no drag & drop
  ordering" being explicitly out of scope.

## Validation Results

- **`tsc --noEmit`**: clean except the two expected, sandbox-only
  `uuid`-module-not-found errors described above (verified via a
  temporary type shim that everything else type-checks correctly) —
  plus the same one pre-existing, unrelated error as every phase.
- **`eslint`** on every new/modified Gallery file: clean (several
  formatting-only issues surfaced during development, all mine, fixed
  via `eslint --fix` and reverified). `menu.service.ts`'s pre-existing
  formatting debt (flagged in earlier phases, not introduced by me) is
  untouched, per "don't refactor working code" — confirmed none of it
  is on the one line I actually changed there.
- **No `any`, no `@ts-ignore`/`@ts-nocheck`** in any new application
  code.
- Could not run `npm run typecheck`/`npm run build` directly — same
  sandbox limitation as every phase, compounded this time by not being
  able to install `uuid` either. Local confirmation matters more than
  usual this round.

## Manual Testing Checklist

- [ ] `npm run typecheck` — fully clean (specifically confirms `uuid`
      resolves correctly, which I couldn't verify here)
- [ ] `npm run build` — succeeds
- [ ] Edit an item without replacing its image — caption/alt text/
      featured update, image stays the same, old file NOT deleted
- [ ] Edit an item and replace its image — new image uploads, record
      updates, **old image is deleted from Storage**, new one renders
      in the listing
- [ ] Force an update failure after a successful replacement upload
      (e.g. temporarily break RLS) — confirm the **new** upload gets
      rolled back and the **old** image is still intact and displayed
- [ ] Delete an item — confirmation dialog shows the caption when one
      exists, generic wording when it doesn't; soft-deletes the row;
      best-effort removes the Storage file; listing refreshes
      immediately
- [ ] Cancel button on both Create and Edit forms — no save attempted,
      returns to the listing
- [ ] Loading states: skeleton on the Edit page while the item loads;
      submit button shows a spinner + "Saving…" during both create and
      update
- [ ] Success/error toasts appear correctly for create, update, and
      delete
- [ ] Visiting `/admin/gallery/$imageId/edit` with a bad/deleted id
      shows the "not found" error state with a working "Back to
      Gallery" button (and no "Try again" button, matching Menu's
      treatment of `not_found`)
- [ ] No console errors anywhere in this flow
