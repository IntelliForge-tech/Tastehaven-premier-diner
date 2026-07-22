import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Testimonials service.
 *
 * Phase 8A: read-only listing. Phase 8B adds createTestimonial().
 * UI components never import the Supabase client or `database.types.ts`
 * directly — they call this service's functions and get back small,
 * UI-safe result types instead, following the same pattern as
 * menu.service.ts and gallery.service.ts.
 */

export type TestimonialsServiceErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface TestimonialsServiceError {
  code: TestimonialsServiceErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase/Postgres error message. */
  message: string;
}

export interface TestimonialItem {
  id: string;
  customerName: string;
  /** Role or location — nullable on the table. */
  roleOrLocation: string | null;
  rating: number;
  reviewText: string;
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
  createdAt: string;
}

export type GetTestimonialsResult =
  { success: true; data: TestimonialItem[] } | { success: false; error: TestimonialsServiceError };

/**
 * Fetches all testimonials ordered by display_order ASC, then
 * customer_name as a stable tiebreaker.
 *
 * Note: there is no `photo_url` or `deleted_at` column on the
 * `testimonials` table — confirmed from database.types.ts. Unlike
 * menu_items and gallery_images, testimonials uses `is_visible` rather
 * than soft-delete to control visibility; this listing returns *all*
 * rows (both visible and hidden) so the admin can see and manage both
 * states. `is_visible` is displayed as the "Active" status column so the
 * admin can see which testimonials are currently shown to site visitors.
 */
export async function getTestimonials(): Promise<GetTestimonialsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("testimonials")
      .select(
        "id, customer_name, role_or_location, rating, review_text, is_featured, is_visible, display_order, created_at",
      )
      .order("display_order", { ascending: true })
      .order("customer_name", { ascending: true });

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    const items: TestimonialItem[] = data.map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      roleOrLocation: row.role_or_location,
      rating: row.rating,
      reviewText: row.review_text,
      isFeatured: row.is_featured,
      isVisible: row.is_visible,
      displayOrder: row.display_order,
      createdAt: row.created_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

// ============================================================================
// Phase 8B — Create
// ============================================================================

export interface CreateTestimonialInput {
  customerName: string;
  /** Null when the field is left blank. */
  roleOrLocation: string | null;
  rating: number;
  reviewText: string;
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
}

export type CreateTestimonialResult =
  | { success: true; data: { id: string } }
  | { success: false; error: TestimonialsServiceError };

/** Inserts a new testimonial row. No image upload — testimonials use initials derived from the name. */
export async function createTestimonial(
  input: CreateTestimonialInput,
): Promise<CreateTestimonialResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        customer_name: input.customerName,
        role_or_location: input.roleOrLocation,
        rating: input.rating,
        review_text: input.reviewText,
        is_featured: input.isFeatured,
        is_visible: input.isVisible,
        display_order: input.displayOrder,
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

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete" = "load",
): TestimonialsServiceError {
  console.error(`[testimonials.service] ${context} failed:`, error.message);

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save that testimonial. Please try again."
        : context === "delete"
          ? "We couldn't delete that testimonial. Please try again."
          : "We couldn't load testimonials right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "delete" = "load",
): TestimonialsServiceError {
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
        ? "Something went wrong saving that testimonial. Please try again."
        : context === "delete"
          ? "Something went wrong deleting that testimonial. Please try again."
          : "Something went wrong loading testimonials. Please try again.",
  };
}

// ============================================================================
// Phase 8C — Get by ID, Update, Delete
// ============================================================================

/** The shape needed by the edit form's default values. */
export interface TestimonialDetail {
  id: string;
  customerName: string;
  roleOrLocation: string | null;
  rating: number;
  reviewText: string;
  isFeatured: boolean;
  isVisible: boolean;
  displayOrder: number;
}

export type GetTestimonialByIdResult =
  | { success: true; data: TestimonialDetail }
  | { success: false; error: TestimonialsServiceError };

/**
 * Fetches a single testimonial by id for the Edit form. Mirrors
 * getGalleryItemById() and getMenuItemById() exactly: a missing row is
 * the "not_found" error so the Edit page can distinguish "try again" from
 * "it's gone, go back to the list."
 */
export async function getTestimonialById(id: string): Promise<GetTestimonialByIdResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("testimonials")
      .select(
        "id, customer_name, role_or_location, rating, review_text, is_featured, is_visible, display_order",
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
          message: "This testimonial no longer exists. It may have already been deleted.",
        },
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        customerName: data.customer_name,
        roleOrLocation: data.role_or_location,
        rating: data.rating,
        reviewText: data.review_text,
        isFeatured: data.is_featured,
        isVisible: data.is_visible,
        displayOrder: data.display_order,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

/** Same fields as CreateTestimonialInput — every editable field, since the edit form always submits the full record. */
export type UpdateTestimonialInput = CreateTestimonialInput;

export type UpdateTestimonialResult =
  | { success: true }
  | { success: false; error: TestimonialsServiceError };

export async function updateTestimonial(
  id: string,
  input: UpdateTestimonialInput,
): Promise<UpdateTestimonialResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("testimonials")
      .update({
        customer_name: input.customerName,
        role_or_location: input.roleOrLocation,
        rating: input.rating,
        review_text: input.reviewText,
        is_featured: input.isFeatured,
        is_visible: input.isVisible,
        display_order: input.displayOrder,
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

export type DeleteTestimonialResult =
  | { success: true }
  | { success: false; error: TestimonialsServiceError };

/**
 * Hard-deletes a testimonial row. Unlike menu_items and gallery_images
 * (which soft-delete via `deleted_at`), the `testimonials` table has no
 * `deleted_at` column — confirmed from database.types.ts — so this is
 * a real DELETE rather than an UPDATE. The listing's RLS policy is the
 * same for both paths from the admin's perspective.
 */
export async function deleteTestimonial(id: string): Promise<DeleteTestimonialResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      return { success: false, error: mapPostgrestError(error, "delete") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "delete") };
  }
}
