import type { PostgrestError } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Gallery service.
 *
 * Phase 7A added read-only listing. Phase 7B added the create workflow.
 * Phase 7C completes the module with fetch-by-id, update (including
 * image replacement), and (soft) delete. UI components never import the
 * Supabase client or `database.types.ts` directly — they call this
 * service's functions and get back small, UI-safe result types instead,
 * following the same pattern as auth.service.ts and menu.service.ts.
 */

export type GalleryServiceErrorCode =
  "network_error" | "upload_error" | "not_found" | "unexpected_error";

export interface GalleryServiceError {
  code: GalleryServiceErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase/Postgres error message. */
  message: string;
}

export interface GalleryImageItem {
  id: string;
  imageUrl: string;
  /**
   * There's no separate "title" column on `gallery_images` — `caption`
   * is the closest analog (a short, optional, human-written label) and
   * is what card UIs display as the item's title. Mirrors the real
   * schema rather than inventing a field that doesn't exist.
   */
  caption: string | null;
  /** Required (not nullable) on the table — accessibility/SEO baseline. */
  altText: string;
  isFeatured: boolean;
  displayOrder: number;
  /** Null if the image is uncategorized, or its category was removed (category_id is nullable, on delete set null). */
  categoryName: string | null;
}

export type GetGalleryItemsResult =
  { success: true; data: GalleryImageItem[] } | { success: false; error: GalleryServiceError };

/**
 * Fetches every non-deleted gallery image with its category name,
 * ordered by display_order (then created_at as a stable tiebreaker —
 * gallery_images has no name-like column to break ties on the way
 * menu_items does).
 *
 * Row Level Security note: authenticated admins match the
 * `gallery_images_admin_all` policy, so this returns *all* non-deleted
 * images. `deleted_at` is filtered here explicitly rather than relied on
 * from RLS alone, same as getMenuItems().
 */
export async function getGalleryItems(): Promise<GetGalleryItemsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    // Two plain, fully-typed queries joined client-side, rather than a
    // nested/embedded select — same approach as getMenuItems(), keeps
    // every field access typed directly against database.types.ts's
    // hand-authored Row shapes with no casts.
    const [imagesResult, categoriesResult] = await Promise.all([
      supabase
        .from("gallery_images")
        .select("id, image_url, caption, alt_text, is_featured, display_order, category_id")
        .is("deleted_at", null)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.from("gallery_categories").select("id, name"),
    ]);

    if (imagesResult.error) {
      return { success: false, error: mapPostgrestError(imagesResult.error) };
    }
    if (categoriesResult.error) {
      return { success: false, error: mapPostgrestError(categoriesResult.error) };
    }

    const categoryNameById = new Map(categoriesResult.data.map((c) => [c.id, c.name]));

    const items: GalleryImageItem[] = imagesResult.data.map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      caption: row.caption,
      altText: row.alt_text,
      isFeatured: row.is_featured,
      displayOrder: row.display_order,
      categoryName: row.category_id ? (categoryNameById.get(row.category_id) ?? null) : null,
    }));

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete" = "load",
): GalleryServiceError {
  console.error(`[gallery.service] ${context} failed:`, error.message);

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save that gallery image. Please try again."
        : context === "delete"
          ? "We couldn't delete that gallery image. Please try again."
          : "We couldn't load the gallery right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "upload" | "delete" = "load",
): GalleryServiceError {
  // fetch() throws a TypeError specifically for network-level failures
  // that occur before any response is received — same convention as
  // auth.service.ts's and menu.service.ts's mapUnexpectedError.
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  const action =
    context === "save"
      ? "saving that gallery image"
      : context === "upload"
        ? "uploading the image"
        : context === "delete"
          ? "deleting that gallery image"
          : "loading the gallery";

  return {
    code: "unexpected_error",
    message: `Something went wrong ${action}. Please try again.`,
  };
}

// ============================================================================
// Phase 7B — Create Gallery Image
// ============================================================================

export interface CreateGalleryItemInput {
  /** Empty string is normalized to null before this reaches the service — see useCreateGalleryItem. */
  caption: string | null;
  altText: string;
  isFeatured: boolean;
  /** Public URL already produced by uploadGalleryImage(). */
  imageUrl: string;
}

export type CreateGalleryItemResult =
  { success: true; data: { id: string } } | { success: false; error: GalleryServiceError };

/**
 * Inserts a new gallery image record.
 *
 * By the time input reaches here, React Hook Form + Zod have already
 * validated it client-side, and uploadGalleryImage() has already
 * produced a real Storage URL — this function's job is only to talk to
 * Supabase and translate whatever comes back, per the layering rule
 * (services own Supabase communication and error mapping, not form
 * validation or upload orchestration — that's useCreateGalleryItem's
 * job). `category_id` and `display_order` are left to their database
 * defaults (NULL and 0) — not form fields this phase, same choice
 * already made for Menu's create form.
 */
export async function createGalleryItem(
  input: CreateGalleryItemInput,
): Promise<CreateGalleryItemResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("gallery_images")
      .insert({
        caption: input.caption,
        alt_text: input.altText,
        is_featured: input.isFeatured,
        image_url: input.imageUrl,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "save") };
    }

    return { success: true, data: { id: data.id } };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

export type UploadGalleryImageResult =
  { success: true; data: { publicUrl: string } } | { success: false; error: GalleryServiceError };

const GALLERY_IMAGE_BUCKET = "restaurant-media";
/** Matches the `gallery/` folder listed in the project handoff's storage folder structure. */
const GALLERY_IMAGE_FOLDER = "gallery";

/**
 * Uploads a gallery image to the existing `restaurant-media` bucket
 * under its `gallery/` folder, and returns the file's public URL —
 * same bucket, same public-read/no-signed-URL reasoning, same
 * random-prefix-for-uniqueness approach as uploadMenuItemImage().
 *
 * Uses `uuidv4()` from the `uuid` package, matching `uploadMenuItemImage()`
 * (also switched to `uuidv4()` this phase, for consistency — see Phase
 * 7C's delivery notes for the full history: this line went
 * `crypto.randomUUID()` → `uuid` → back to `crypto.randomUUID()` →
 * `uuid` again across this project, each switch driven by whether
 * `uuid` was actually confirmed installed at the time).
 */
export async function uploadGalleryImage(file: File): Promise<UploadGalleryImageResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const path = `${GALLERY_IMAGE_FOLDER}/${uuidv4()}-${slugifyFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(GALLERY_IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[gallery.service] uploadGalleryImage failed:", uploadError.message);
      return {
        success: false,
        error: {
          code: "upload_error",
          message: "We couldn't upload that image. Please try a different file or try again.",
        },
      };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(GALLERY_IMAGE_BUCKET).getPublicUrl(path);

    return {
      success: true,
      data: {
        publicUrl,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: mapUnexpectedError(err, "upload"),
    };
  }
}

/** Keeps the human-readable part of the stored filename URL-safe; the random id in front of it is what actually guarantees uniqueness. Duplicated from menu.service.ts's identical helper rather than shared, matching this codebase's existing convention of each service owning its own small helpers (see mapPostgrestError/mapUnexpectedError above). */
function slugifyFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Best-effort removal of a gallery image's file from Storage — used
 * after a successful create-failure rollback (Phase 7B), and now also
 * after a successful replace (old image) or delete (current image) in
 * Phase 7C, mirroring deleteMenuItemImage()'s exact reasoning:
 * deliberately swallows its own errors and returns nothing, since an
 * orphaned file in Storage is a minor cleanup issue, but failing the
 * caller's already-successful save/delete over it would be worse.
 */
export async function deleteGalleryImage(imageUrl: string): Promise<void> {
  try {
    const path = extractGalleryImageStoragePath(imageUrl);
    if (!path) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage.from(GALLERY_IMAGE_BUCKET).remove([path]);

    if (error) {
      console.error("[gallery.service] deleteGalleryImage failed:", error.message);
    }
  } catch (err) {
    console.error("[gallery.service] deleteGalleryImage failed:", err);
  }
}

function extractGalleryImageStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${GALLERY_IMAGE_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  return publicUrl.slice(markerIndex + marker.length);
}

// ============================================================================
// Phase 7C — Edit, Replace & Delete Gallery Image
// ============================================================================

export interface GalleryItemDetail {
  id: string;
  caption: string | null;
  altText: string;
  isFeatured: boolean;
  imageUrl: string;
}

export type GetGalleryItemByIdResult =
  { success: true; data: GalleryItemDetail } | { success: false; error: GalleryServiceError };

/**
 * Fetches a single gallery image by id, for the Edit form's default
 * values. Mirrors getMenuItemById() exactly, including how a missing or
 * already soft-deleted row is reported as the same "not_found" error —
 * the Edit page's response to both is identical: tell the admin it's
 * gone and send them back to the list.
 */
export async function getGalleryItemById(id: string): Promise<GetGalleryItemByIdResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("gallery_images")
      .select("id, caption, alt_text, is_featured, image_url")
      .eq("id", id)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    if (!data) {
      return {
        success: false,
        error: {
          code: "not_found",
          message: "This gallery image no longer exists. It may have already been deleted.",
        },
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        caption: data.caption,
        altText: data.alt_text,
        isFeatured: data.is_featured,
        imageUrl: data.image_url,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

/** Same shape as create — every editable field is required, since the Edit form always submits the full record. */
export type UpdateGalleryItemInput = CreateGalleryItemInput;

export type UpdateGalleryItemResult =
  { success: true } | { success: false; error: GalleryServiceError };

/**
 * Updates an existing gallery image record.
 *
 * Like createGalleryItem, this only talks to Supabase — the caller (see
 * useUpdateGalleryItem) is responsible for deciding whether a
 * replacement image needs uploading first, for rolling that upload back
 * if this update fails, and for cleaning up the old image afterward
 * once this succeeds.
 */
export async function updateGalleryItem(
  id: string,
  input: UpdateGalleryItemInput,
): Promise<UpdateGalleryItemResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("gallery_images")
      .update({
        caption: input.caption,
        alt_text: input.altText,
        is_featured: input.isFeatured,
        image_url: input.imageUrl,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: mapPostgrestError(error, "save") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

export type DeleteGalleryItemResult =
  { success: true } | { success: false; error: GalleryServiceError };

/**
 * Soft-deletes a gallery image by stamping `deleted_at`, consistent
 * with how getGalleryItems()/getGalleryItemById() already filter on
 * that column — mirrors deleteMenuItem()'s exact reasoning: a hard
 * DELETE was intentionally avoided so the row isn't destroyed.
 */
export async function deleteGalleryItem(id: string): Promise<DeleteGalleryItemResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("gallery_images")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return { success: false, error: mapPostgrestError(error, "delete") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "delete") };
  }
}

// ============================================================================
// Phase 7D — Reorder Gallery Images
// ============================================================================

export interface GalleryOrderUpdate {
  id: string;
  displayOrder: number;
}

export type UpdateGalleryOrderResult =
  | { success: true }
  | { success: false; error: GalleryServiceError };

/**
 * Persists a new display_order for each given image.
 *
 * Deliberately N individual `.update().eq('id', ...)` calls run
 * concurrently via `Promise.all`, not a single `.upsert()` call: an
 * upsert with only `id`/`display_order` supplied would still have to
 * satisfy `gallery_images`'s other NOT NULL columns (`alt_text`,
 * `image_url`) on the INSERT branch Postgres plans for an ON CONFLICT
 * clause, even though every id here is already guaranteed to exist —
 * Postgres validates the insert values before it ever checks the
 * conflict, so that insert branch would fail regardless. Individual
 * updates sidestep that entirely and only ever touch the one column
 * they're supposed to.
 *
 * If any individual update fails, the first failure's error is
 * returned — the caller (useReorderGallery) treats this as an
 * all-or-nothing operation and rolls the UI back to the pre-drag order,
 * rather than trying to reconcile a partially-applied reorder.
 */
export async function updateGalleryOrder(
  updates: GalleryOrderUpdate[],
): Promise<UpdateGalleryOrderResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const results = await Promise.all(
      updates.map((update) =>
        supabase
          .from("gallery_images")
          .update({ display_order: update.displayOrder })
          .eq("id", update.id),
      ),
    );

    const failed = results.find((result) => result.error);

    if (failed?.error) {
      return { success: false, error: mapPostgrestError(failed.error, "save") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}
