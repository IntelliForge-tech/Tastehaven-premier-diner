import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Public testimonials service — reads live testimonials for the public
 * website's Testimonials carousel section.
 *
 * Separate from `testimonials.service.ts` (the admin CRUD service) for
 * the same reason gallery.public.service.ts is separate from
 * gallery.service.ts: public components must never import admin-only
 * logic, and the public query only needs the minimal field set the
 * carousel actually renders.
 *
 * Visibility gate: `is_visible = true`. Unlike gallery_images which
 * uses `deleted_at` for soft-delete, the testimonials table has no
 * `deleted_at` — `is_visible` is the sole toggle for public visibility,
 * confirmed from database.types.ts Row type.
 */

export type PublicTestimonialsErrorCode = "network_error" | "unexpected_error";

export interface PublicTestimonialsError {
  code: PublicTestimonialsErrorCode;
  message: string;
}

/** Exactly the fields the Testimonials carousel renders — nothing more. */
export interface PublicTestimonial {
  id: string;
  /** Maps to `customer_name` in the DB. Used as the carousel key and display name. */
  name: string;
  /** Maps to `role_or_location`. Nullable — rendered only when present. */
  role: string | null;
  /** Integer 1–5, controls how many stars are filled. */
  rating: number;
  /** Maps to `review_text`. The quoted body of the testimonial. */
  text: string;
}

export type GetPublicTestimonialsResult =
  | { success: true; data: PublicTestimonial[] }
  | { success: false; error: PublicTestimonialsError };

/**
 * Fetches all visible testimonials ordered by display_order ASC,
 * then created_at ASC as a tiebreaker. Only `is_visible = true` rows
 * are returned — the admin can hide any testimonial without deleting it.
 */
export async function getPublicTestimonials(): Promise<GetPublicTestimonialsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, customer_name, role_or_location, rating, review_text")
      .eq("is_visible", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: mapPostgrestError(error) };
    }

    const items: PublicTestimonial[] = data.map((row) => ({
      id: row.id,
      name: row.customer_name,
      role: row.role_or_location,
      rating: row.rating,
      text: row.review_text,
    }));

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapPostgrestError(error: PostgrestError): PublicTestimonialsError {
  console.error("[testimonials.public.service] failed:", error.message);
  return {
    code: "unexpected_error",
    message: "We couldn't load testimonials right now.",
  };
}

function mapUnexpectedError(err: unknown): PublicTestimonialsError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong loading testimonials.",
  };
}
