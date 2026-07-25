import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Public chefs service — reads live chef profiles for the public
 * website's Chefs section.
 *
 * Separate from `chefs.service.ts` (the admin CRUD service) for the
 * same reasons as gallery.public.service.ts and
 * testimonials.public.service.ts: public components must never import
 * admin-only logic, and this query only needs the minimal field set
 * the Chefs section actually renders.
 *
 * Visibility gate: `is_active = true`. The chefs table has no
 * `deleted_at` column — `is_active` is the sole toggle for public
 * visibility, confirmed from database.types.ts Row type.
 *
 * Note: `image_url` is nullable on this table (unlike gallery_images
 * where it is NOT NULL). The component handles a null image by
 * omitting the <img> — see ChefCard below.
 */

export type PublicChefsErrorCode = "network_error" | "unexpected_error";

export interface PublicChefsError {
  code: PublicChefsErrorCode;
  message: string;
}

/** Exactly the fields the Chefs section renders — nothing more. */
export interface PublicChef {
  id: string;
  name: string;
  /** Maps to `position` in the DB — the component renders it as the chef's role label. */
  role: string;
  bio: string | null;
  /** Nullable — a chef without a photo renders a placeholder instead. */
  image: string | null;
}

export type GetPublicChefsResult =
  | { success: true; data: PublicChef[] }
  | { success: false; error: PublicChefsError };

/**
 * Fetches all active chefs ordered by display_order ASC, then
 * created_at ASC as a tiebreaker. Only `is_active = true` rows are
 * returned.
 */
export async function getPublicChefs(): Promise<GetPublicChefsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("chefs")
      .select("id, name, position, bio, image_url")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: mapPostgrestError(error) };
    }

    const chefs: PublicChef[] = data.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.position,
      bio: row.bio,
      image: row.image_url,
    }));

    return { success: true, data: chefs };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapPostgrestError(error: PostgrestError): PublicChefsError {
  console.error("[chefs.public.service] failed:", error.message);
  return {
    code: "unexpected_error",
    message: "We couldn't load chef profiles right now.",
  };
}

function mapUnexpectedError(err: unknown): PublicChefsError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong loading chef profiles.",
  };
}
