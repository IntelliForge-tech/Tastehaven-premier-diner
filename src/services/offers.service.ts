import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Special Offers service.
 *
 * Phase 10A: read-only listing. UI components never import the Supabase
 * client or `database.types.ts` directly — they call this service's
 * functions and get back small, UI-safe result types instead, following
 * the same pattern as menu.service.ts, gallery.service.ts,
 * testimonials.service.ts, and chefs.service.ts.
 *
 * Schema notes (confirmed from database.types.ts):
 * - No `image_url` column — offers have no images. The `icon` column is
 *   a nullable string (emoji or icon name), not a Storage image.
 * - `tag` — nullable label string (e.g. "Limited Time", "Weekend Only").
 * - `valid_from` / `valid_until` — nullable ISO date strings.
 * - `is_active` — the visibility/status flag; no `deleted_at` column.
 * - `display_order` — ordering, integer, defaults to 0.
 */

export type OffersServiceErrorCode = "network_error" | "not_found" | "unexpected_error";

export interface OffersServiceError {
  code: OffersServiceErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase/Postgres error message. */
  message: string;
}

export interface OfferItem {
  id: string;
  title: string;
  description: string | null;
  tag: string | null;
  icon: string | null;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export type GetOffersResult =
  { success: true; data: OfferItem[] } | { success: false; error: OffersServiceError };

/**
 * Fetches all special offers ordered by display_order ASC, then title
 * as a stable tiebreaker. Returns all rows (active and inactive) so the
 * admin can see and manage both states — the public site's RLS/query
 * filters to `is_active = true` for visitors.
 */
export async function getOffers(): Promise<GetOffersResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("special_offers")
      .select(
        "id, title, description, tag, icon, valid_from, valid_until, is_active, display_order, created_at",
      )
      .order("display_order", { ascending: true })
      .order("title", { ascending: true });

    if (error) {
      return { success: false, error: mapPostgrestError(error, "load") };
    }

    const items: OfferItem[] = data.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      tag: row.tag,
      icon: row.icon,
      validFrom: row.valid_from,
      validUntil: row.valid_until,
      isActive: row.is_active,
      displayOrder: row.display_order,
      createdAt: row.created_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete" = "load",
): OffersServiceError {
  console.error(`[offers.service] ${context} failed:`, error.message);

  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save that offer. Please try again."
        : context === "delete"
          ? "We couldn't delete that offer. Please try again."
          : "We couldn't load offers right now. Please try again.",
  };
}

function mapUnexpectedError(err: unknown): OffersServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  return {
    code: "unexpected_error",
    message: "Something went wrong loading offers. Please try again.",
  };
}

// ============================================================================
// Phase 10B — Create Offer
// ============================================================================

export interface CreateOfferInput {
  title: string;
  /** Empty string normalised to null by useCreateOffer before this reaches the service. */
  description: string | null;
  tag: string | null;
  icon: string | null;
  /** ISO date string or null. */
  validFrom: string | null;
  /** ISO date string or null. */
  validUntil: string | null;
  isActive: boolean;
  displayOrder: number;
}

export type CreateOfferResult =
  { success: true; data: { id: string } } | { success: false; error: OffersServiceError };

/**
 * Inserts a new special_offers row. Only columns that actually exist on
 * the table are written — confirmed against database.types.ts's Insert
 * type. No image upload step (no image_url column exists).
 */
export async function createOffer(input: CreateOfferInput): Promise<CreateOfferResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("special_offers")
      .insert({
        title: input.title,
        description: input.description,
        tag: input.tag,
        icon: input.icon,
        valid_from: input.validFrom,
        valid_until: input.validUntil,
        is_active: input.isActive,
        display_order: input.displayOrder,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: mapPostgrestError(error, "save") };
    }

    return { success: true, data: { id: data.id } };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

// ============================================================================
// Phase 10C — Edit & Delete Offer
// ============================================================================

export interface OfferDetail {
  id: string;
  title: string;
  description: string | null;
  tag: string | null;
  icon: string | null;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  displayOrder: number;
}

export type GetOfferByIdResult =
  | { success: true; data: OfferDetail }
  | { success: false; error: OffersServiceError };

/**
 * Fetches a single offer by id for the Edit form's default values.
 * Missing row reported as "not_found" — the edit page's only sensible
 * response is navigation back to the list.
 */
export async function getOfferById(id: string): Promise<GetOfferByIdResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("special_offers")
      .select(
        "id, title, description, tag, icon, valid_from, valid_until, is_active, display_order",
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
          message: "This offer no longer exists. It may have already been deleted.",
        },
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        tag: data.tag,
        icon: data.icon,
        validFrom: data.valid_from,
        validUntil: data.valid_until,
        isActive: data.is_active,
        displayOrder: data.display_order,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export type UpdateOfferInput = CreateOfferInput;

export type UpdateOfferResult =
  | { success: true }
  | { success: false; error: OffersServiceError };

/**
 * Updates an existing special_offers row. Only real columns are written
 * — same column list as createOffer(), confirmed against database.types.ts.
 * No image handling (no image_url column exists on this table).
 */
export async function updateOffer(
  id: string,
  input: UpdateOfferInput,
): Promise<UpdateOfferResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("special_offers")
      .update({
        title: input.title,
        description: input.description,
        tag: input.tag,
        icon: input.icon,
        valid_from: input.validFrom,
        valid_until: input.validUntil,
        is_active: input.isActive,
        display_order: input.displayOrder,
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: mapPostgrestError(error, "save") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export type DeleteOfferResult =
  | { success: true }
  | { success: false; error: OffersServiceError };

/**
 * Hard-deletes a special_offers row. Hard delete (not soft) because the
 * table has no `deleted_at` column — confirmed from database.types.ts
 * Row/Insert types. No Storage cleanup needed (no image_url column).
 */
export async function deleteOffer(id: string): Promise<DeleteOfferResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("special_offers")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: mapPostgrestError(error, "delete") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}
