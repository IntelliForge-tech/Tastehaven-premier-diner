import type { PostgrestError } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Menu service.
 *
 * Phase 6A added read-only listing. Phase 6B added the create workflow:
 * loading categories for the form's select, uploading an image to
 * Storage, and inserting the new row. Phase 6C completes the module with
 * fetch-by-id, update, and (soft) delete. UI components never import the
 * Supabase client or `database.types.ts` directly — they call this
 * service's functions and get back small, UI-safe result types instead,
 * following the same pattern as auth.service.ts.
 */

export type MenuServiceErrorCode =
  | "network_error"
  | "upload_error"
  | "not_found"
  | "unexpected_error";

export interface MenuServiceError {
  code: MenuServiceErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase/Postgres error message. */
  message: string;
}

export interface MenuItemWithCategory {
  id: string;
  name: string;
  description: string | null;
  price: number;
  rating: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  /** Null if the item's category was removed but the item wasn't (FK is non-nullable today, so this is just defensive). */
  categoryName: string | null;
}

export type GetMenuItemsResult =
  | { success: true; data: MenuItemWithCategory[] }
  | { success: false; error: MenuServiceError };

/**
 * Fetches every non-deleted menu item with its category name, ordered by
 * each item's display_order (then name as a stable tiebreaker).
 *
 * Row Level Security note: authenticated admins match the
 * `menu_items_admin_all` policy, so this returns *all* non-deleted items —
 * including unavailable ones — which is what an admin management view
 * needs to see. `deleted_at` is filtered here explicitly rather than
 * relied on from RLS alone, since the admin policy would otherwise still
 * permit soft-deleted rows through.
 */
export async function getMenuItems(): Promise<GetMenuItemsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    // Two plain, fully-typed queries joined client-side, rather than a
    // nested/embedded select — keeps every field access typed directly
    // against database.types.ts's hand-authored Row shapes with no casts.
    const [itemsResult, categoriesResult] = await Promise.all([
      supabase
        .from("menu_items")
        .select(
          "id, name, description, price, rating, image_url, is_available, is_featured, display_order, category_id",
        )
        .is("deleted_at", null)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase.from("menu_categories").select("id, name"),
    ]);

    if (itemsResult.error) {
      return { success: false, error: mapPostgrestError(itemsResult.error) };
    }
    if (categoriesResult.error) {
      return { success: false, error: mapPostgrestError(categoriesResult.error) };
    }

    const categoryNameById = new Map(categoriesResult.data.map((c) => [c.id, c.name]));

    const items: MenuItemWithCategory[] = itemsResult.data.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      price: row.price,
      rating: row.rating,
      imageUrl: row.image_url,
      isAvailable: row.is_available,
      isFeatured: row.is_featured,
      categoryName: categoryNameById.get(row.category_id) ?? null,
    }));

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete" = "load",
): MenuServiceError {
  console.error(`[menu.service] ${context} failed:`, error.message);

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save that menu item. Please try again."
        : context === "delete"
          ? "We couldn't delete that menu item. Please try again."
          : "We couldn't load the menu right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "upload" | "delete" = "load",
): MenuServiceError {
  // fetch() throws a TypeError specifically for network-level failures
  // that occur before any response is received — same convention as
  // auth.service.ts's mapUnexpectedError.
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  const action =
    context === "save"
      ? "saving that menu item"
      : context === "upload"
        ? "uploading the image"
        : context === "delete"
          ? "deleting that menu item"
          : "loading the menu";

  return {
    code: "unexpected_error",
    message: `Something went wrong ${action}. Please try again.`,
  };
}

// ============================================================================
// Phase 6B — Create Menu Item
// ============================================================================

export interface MenuCategory {
  id: string;
  name: string;
}

export type GetMenuCategoriesResult =
  | { success: true; data: MenuCategory[] }
  | { success: false; error: MenuServiceError };

/**
 * Fetches every menu category for the create form's category select.
 *
 * Not filtered by `is_active`: an authenticated admin (matching the
 * `menu_categories_admin_all` RLS policy, which grants full access,
 * unlike the public `is_active = true`-only policy) should be able to
 * assign an item to any category that exists, not only ones currently
 * live on the public site.
 */
export async function getMenuCategories(): Promise<GetMenuCategoriesResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("menu_categories")
      .select("id, name")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

export interface CreateMenuItemInput {
  name: string;
  description: string | null;
  categoryId: string;
  price: number;
  isFeatured: boolean;
  isAvailable: boolean;
  /** Public URL already produced by uploadMenuItemImage(), or null when no image was selected. */
  imageUrl: string | null;
}

export type CreateMenuItemResult =
  | { success: true; data: { id: string } }
  | { success: false; error: MenuServiceError };

/**
 * Inserts a new menu item.
 *
 * By the time input reaches here, React Hook Form + Zod have already
 * validated it client-side — this function's job is only to talk to
 * Supabase and translate whatever comes back, per the layering rule
 * (services own Supabase communication and error mapping, not form
 * validation). `display_order` and `deleted_at` are left to their
 * database defaults (0 and NULL) — not form fields, per this phase's
 * scope.
 */
export async function createMenuItem(input: CreateMenuItemInput): Promise<CreateMenuItemResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: input.name,
        description: input.description,
        category_id: input.categoryId,
        price: input.price,
        is_featured: input.isFeatured,
        is_available: input.isAvailable,
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

export type UploadMenuItemImageResult =
  | { success: true; data: { publicUrl: string } }
  | { success: false; error: MenuServiceError };

const MENU_IMAGE_BUCKET = "restaurant-media";
/** Matches the `menu/` folder listed in the project handoff's storage folder structure. */
const MENU_IMAGE_FOLDER = "menu";

/**
 * Uploads a menu item image to the existing `restaurant-media` bucket
 * under its `menu/` folder, and returns the file's public URL — the
 * bucket is public-read, so no signed URL is needed, and the public URL
 * is exactly what `image_url` on `menu_items` stores.
 *
 * The stored filename is prefixed with a random id so two uploads never
 * collide and re-uploading a similarly-named file never overwrites or
 * cache-collides with a previous one.
 */
export async function uploadMenuItemImage(
  file: File,
): Promise<UploadMenuItemImageResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const path = `${MENU_IMAGE_FOLDER}/${uuidv4()}-${slugifyFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(MENU_IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[menu.service] uploadMenuItemImage failed:", uploadError.message);
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
    } = supabase.storage
      .from(MENU_IMAGE_BUCKET)
      .getPublicUrl(path);

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
/** Keeps the human-readable part of the stored filename URL-safe; the random id in front of it is what actually guarantees uniqueness. */
function slugifyFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// ============================================================================
// Phase 6C — Edit & Delete Menu Item
// ============================================================================

export interface MenuItemDetail {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  price: number;
  isFeatured: boolean;
  isAvailable: boolean;
  imageUrl: string | null;
}

export type GetMenuItemByIdResult =
  | { success: true; data: MenuItemDetail }
  | { success: false; error: MenuServiceError };

/**
 * Fetches a single menu item by id for the Edit form's default values.
 * Returns categoryId (not categoryName) since the edit form needs the id
 * for its Select, unlike the listing's MenuItemWithCategory.
 *
 * A missing or already soft-deleted row is reported as the same
 * "not_found" error (rather than distinguishing "doesn't exist" from
 * "was deleted") — the Edit page's response to both is identical: tell
 * the admin it's gone and send them back to the list.
 */
export async function getMenuItemById(id: string): Promise<GetMenuItemByIdResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("menu_items")
      .select("id, name, description, category_id, price, is_featured, is_available, image_url")
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
          message: "This menu item no longer exists. It may have already been deleted.",
        },
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        categoryId: data.category_id,
        price: data.price,
        isFeatured: data.is_featured,
        isAvailable: data.is_available,
        imageUrl: data.image_url,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

/** Same shape as create — every editable field is required, since the Edit form always submits the full record. */
export type UpdateMenuItemInput = CreateMenuItemInput;

export type UpdateMenuItemResult =
  | { success: true }
  | { success: false; error: MenuServiceError };

/**
 * Updates an existing menu item.
 *
 * Like createMenuItem, this only talks to Supabase — the caller (see
 * useUpdateMenuItem) is responsible for deciding whether a new image
 * needs uploading first and for cleaning up the old one afterward.
 */
export async function updateMenuItem(
  id: string,
  input: UpdateMenuItemInput,
): Promise<UpdateMenuItemResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("menu_items")
      .update({
        name: input.name,
        description: input.description,
        category_id: input.categoryId,
        price: input.price,
        is_featured: input.isFeatured,
        is_available: input.isAvailable,
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

export type DeleteMenuItemResult =
  | { success: true }
  | { success: false; error: MenuServiceError };

/**
 * Soft-deletes a menu item by stamping `deleted_at`, consistent with how
 * getMenuItems()/getMenuItemById() already filter on that column — a hard
 * DELETE was intentionally avoided so the row (and its history/FKs) isn't
 * destroyed, matching the existing soft-delete convention rather than
 * inventing a new one for this phase.
 */
export async function deleteMenuItem(id: string): Promise<DeleteMenuItemResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("menu_items")
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

/**
 * Best-effort removal of a menu item's image from Storage — used after a
 * successful replace (old image) or delete (current image). Deliberately
 * swallows its own errors and returns nothing: an orphaned file in
 * Storage is a minor cleanup issue, but failing the caller's already-
 * successful save/delete over it would be worse. Silently no-ops for a
 * URL that doesn't match this bucket's public URL shape (defensive only;
 * every image_url in this table is produced by uploadMenuItemImage()).
 */
export async function deleteMenuItemImage(imageUrl: string): Promise<void> {
  try {
    const path = extractMenuImageStoragePath(imageUrl);
    if (!path) return;

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.storage.from(MENU_IMAGE_BUCKET).remove([path]);

    if (error) {
      console.error("[menu.service] deleteMenuItemImage failed:", error.message);
    }
  } catch (err) {
    console.error("[menu.service] deleteMenuItemImage failed:", err);
  }
}

function extractMenuImageStoragePath(publicUrl: string): string | null {
  const marker = `/storage/v1/object/public/${MENU_IMAGE_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) return null;

  return publicUrl.slice(markerIndex + marker.length);
}
