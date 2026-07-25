import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Public gallery service — reads live gallery images for the public
 * website's Gallery section.
 *
 * Deliberately separate from `gallery.service.ts` (the admin CRUD
 * service) for two reasons:
 * 1. This query only fetches the fields the public Gallery component
 *    actually needs (imageUrl + altText), not the full admin model.
 * 2. The admin service is used by authenticated routes and must never
 *    be imported by public-facing components — keeping them separate
 *    makes that boundary explicit and prevents accidental leakage of
 *    admin-only logic or import chains into the public bundle.
 *
 * Filtering: `deleted_at IS NULL` (soft-delete convention established
 * in the migrations and mirrored by the admin service). There is no
 * separate `is_published` or `is_active` flag on `gallery_images` —
 * `deleted_at` is the sole visibility gate for this table, confirmed
 * from database.types.ts.
 */

export type PublicGalleryServiceErrorCode = "network_error" | "unexpected_error";

export interface PublicGalleryServiceError {
  code: PublicGalleryServiceErrorCode;
  message: string;
}

/** Minimal shape — exactly what Gallery.tsx needs, nothing more. */
export interface PublicGalleryImage {
  id: string;
  /** Public Supabase Storage URL. Used directly as the <img> src. */
  imageUrl: string;
  /** Non-null on every row (required column in the schema). */
  altText: string;
}

export type GetPublicGalleryResult =
  | { success: true; data: PublicGalleryImage[] }
  | { success: false; error: PublicGalleryServiceError };

/**
 * Fetches all visible gallery images ordered by display_order ASC,
 * then created_at ASC as a stable tiebreaker (same ordering the admin
 * listing uses — so public and admin views are consistent).
 *
 * Only non-deleted rows are returned; the admin's `deleted_at IS NULL`
 * filter is replicated here rather than relying on RLS alone, so the
 * intent is explicit in the query itself.
 */
export async function getPublicGalleryImages(): Promise<GetPublicGalleryResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("gallery_images")
      .select("id, image_url, alt_text")
      .is("deleted_at", null)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: mapPostgrestError(error) };
    }

    const images: PublicGalleryImage[] = data.map((row) => ({
      id: row.id,
      imageUrl: row.image_url,
      altText: row.alt_text,
    }));

    return { success: true, data: images };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapPostgrestError(error: PostgrestError): PublicGalleryServiceError {
  console.error("[gallery.public.service] getPublicGalleryImages failed:", error.message);
  return {
    code: "unexpected_error",
    message: "We couldn't load the gallery right now. Please try again.",
  };
}

function mapUnexpectedError(err: unknown): PublicGalleryServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong loading the gallery. Please try again.",
  };
}
