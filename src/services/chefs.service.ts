import { v4 as uuidv4 } from "uuid";
import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Chefs service.
 *
 * Phase 9A: read-only listing.
 * Phase 9B: createChef(), uploadChefImage(), deleteChefImage().
 * UI components never import the Supabase client or `database.types.ts`
 * directly — they call this service's functions and get back small,
 * UI-safe result types instead, following the same pattern as
 * menu.service.ts, gallery.service.ts, and testimonials.service.ts.
 *
 * Schema notes (confirmed from database.types.ts):
 * - `image_url` — nullable; UI falls back to initials when absent.
 * - `years_experience` — nullable integer.
 * - `social_links` — jsonb; not a form field in 9A/9B (default `{}`).
 * - `is_active` — the visibility/status flag; no `deleted_at` column.
 */

export type ChefsServiceErrorCode =
  | "network_error"
  | "upload_error"
  | "not_found"
  | "unexpected_error";

export interface ChefsServiceError {
  code: ChefsServiceErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase/Postgres error message. */
  message: string;
}

export interface ChefItem {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  yearsExperience: number | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export type GetChefsResult =
  | { success: true; data: ChefItem[] }
  | { success: false; error: ChefsServiceError };

/**
 * Fetches all chefs ordered by display_order ASC, then name as a stable
 * tiebreaker. Returns all rows (active and inactive) so the admin can
 * see and manage both states — public site RLS is what filters to
 * `is_active = true` for visitors.
 */
export async function getChefs(): Promise<GetChefsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("chefs")
      .select(
        "id, name, position, bio, years_experience, image_url, is_active, display_order, created_at",
      )
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    const items: ChefItem[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      position: row.position,
      bio: row.bio,
      yearsExperience: row.years_experience,
      imageUrl: row.image_url,
      isActive: row.is_active,
      displayOrder: row.display_order,
      createdAt: row.created_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete" = "load",
): ChefsServiceError {
  console.error(`[chefs.service] ${context} failed:`, error.message);

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save that chef profile. Please try again."
        : context === "delete"
          ? "We couldn't delete that chef profile. Please try again."
          : "We couldn't load chef profiles right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "delete" | "upload" = "load",
): ChefsServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "Something went wrong saving that chef profile. Please try again."
        : context === "delete"
          ? "Something went wrong deleting that chef profile. Please try again."
          : context === "upload"
            ? "Something went wrong uploading that image. Please try again."
            : "Something went wrong loading chef profiles. Please try again.",
  };
}

// ============================================================================
// Phase 9B — Create Chef
// ============================================================================

const CHEF_IMAGE_BUCKET = "restaurant-media";
/** Matches the storage folder convention established for menu/ and gallery/. */
const CHEF_IMAGE_FOLDER = "chefs";

export interface CreateChefInput {
  name: string;
  position: string;
  bio: string | null;
  yearsExperience: number | null;
  displayOrder: number;
  isActive: boolean;
  /** Public URL already produced by uploadChefImage(), or null if no image was selected. */
  imageUrl: string | null;
}

export type CreateChefResult =
  | { success: true; data: { id: string } }
  | { success: false; error: ChefsServiceError };

/**
 * Inserts a new chef row. `social_links` defaults to `{}` (its column
 * default) — not a form field in Phase 9B. Called by useCreateChef()
 * after a successful uploadChefImage(), never by UI directly.
 */
export async function createChef(input: CreateChefInput): Promise<CreateChefResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("chefs")
      .insert({
        name: input.name,
        position: input.position,
        bio: input.bio,
        years_experience: input.yearsExperience,
        display_order: input.displayOrder,
        is_active: input.isActive,
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

export type UploadChefImageResult =
  | { success: true; data: { publicUrl: string } }
  | { success: false; error: ChefsServiceError };

/**
 * Uploads a chef photo to `restaurant-media/chefs/` and returns the
 * public URL — same bucket, same folder-per-content-type convention,
 * same uuidv4()-prefix uniqueness strategy as gallery.service.ts and
 * menu.service.ts.
 */
export async function uploadChefImage(file: File): Promise<UploadChefImageResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const path = `${CHEF_IMAGE_FOLDER}/${uuidv4()}-${slugifyFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(CHEF_IMAGE_BUCKET)
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("[chefs.service] uploadChefImage failed:", uploadError.message);
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
    } = supabase.storage.from(CHEF_IMAGE_BUCKET).getPublicUrl(path);

    return { success: true, data: { publicUrl } };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "upload") };
  }
}

/**
 * Best-effort removal of a chef image from Storage — used for rollback
 * when createChef() fails after a successful uploadChefImage(). Swallows
 * its own errors (same pattern as deleteGalleryImage()) so a cleanup
 * failure never masks the real insert error being returned to the caller.
 */
export async function deleteChefImage(imageUrl: string): Promise<void> {
  try {
    const path = extractChefImageStoragePath(imageUrl);
    if (!path) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage.from(CHEF_IMAGE_BUCKET).remove([path]);

    if (error) {
      console.error("[chefs.service] deleteChefImage failed:", error.message);
    }
  } catch (err) {
    console.error("[chefs.service] deleteChefImage failed:", err);
  }
}

function extractChefImageStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${CHEF_IMAGE_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);
  if (markerIndex === -1) return null;
  return publicUrl.slice(markerIndex + marker.length);
}

function slugifyFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================================================
// Phase 9C — Edit & Delete Chef
// ============================================================================

export interface ChefDetail {
  id: string;
  name: string;
  position: string;
  bio: string | null;
  yearsExperience: number | null;
  imageUrl: string | null;
  isActive: boolean;
  displayOrder: number;
}

export type GetChefByIdResult =
  | { success: true; data: ChefDetail }
  | { success: false; error: ChefsServiceError };

/**
 * Fetches a single chef by id for the Edit form's default values.
 * Mirrors getGalleryItemById() exactly: a missing row (id not found or
 * no rows returned) is reported as "not_found" — the Edit page's
 * response to both is identical: tell the admin it's gone and offer
 * navigation back to the list.
 */
export async function getChefById(id: string): Promise<GetChefByIdResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("chefs")
      .select(
        "id, name, position, bio, years_experience, image_url, is_active, display_order",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    if (!data) {
      return {
        success: false,
        error: {
          code: "not_found",
          message: "This chef profile no longer exists. It may have already been deleted.",
        },
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        position: data.position,
        bio: data.bio,
        yearsExperience: data.years_experience,
        imageUrl: data.image_url,
        isActive: data.is_active,
        displayOrder: data.display_order,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

export interface UpdateChefInput {
  name: string;
  position: string;
  bio: string | null;
  yearsExperience: number | null;
  displayOrder: number;
  isActive: boolean;
  /** The final image URL to store — either the original unchanged URL, or the newly uploaded one. */
  imageUrl: string | null;
}

export type UpdateChefResult =
  | { success: true }
  | { success: false; error: ChefsServiceError };

/**
 * Updates an existing chef record. Like createChef(), only talks to
 * Supabase — the caller (useUpdateChef) decides whether a replacement
 * image needs uploading first, rolls back that upload if this fails,
 * and cleans up the old image afterward once this succeeds.
 */
export async function updateChef(
  id: string,
  input: UpdateChefInput,
): Promise<UpdateChefResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("chefs")
      .update({
        name: input.name,
        position: input.position,
        bio: input.bio,
        years_experience: input.yearsExperience,
        display_order: input.displayOrder,
        is_active: input.isActive,
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

export type DeleteChefResult =
  | { success: true }
  | { success: false; error: ChefsServiceError };

/**
 * Hard-deletes a chef record.
 *
 * Hard delete (not soft) because the `chefs` table has no `deleted_at`
 * column — confirmed from database.types.ts Insert/Row types. Unlike
 * gallery_images and menu_items (both of which have `deleted_at` and
 * are soft-deleted), chefs has no such column, so a soft delete would
 * require either adding a migration or stamping a non-existent field.
 * Neither is in scope for Phase 9C.
 *
 * Storage cleanup is best-effort and lives in the hook caller — same
 * separation of concerns as deleteGalleryItem().
 */
export async function deleteChef(id: string): Promise<DeleteChefResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("chefs").delete().eq("id", id);

    if (error) {
      return { success: false, error: mapPostgrestError(error, "delete") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "delete") };
  }
}
