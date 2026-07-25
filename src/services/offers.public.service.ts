import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Public offers service — reads live special offers for the public
 * website's Offers section.
 *
 * Separate from `offers.service.ts` (the admin CRUD service) for the
 * same reason as the other public services: public components must
 * never import admin-only logic.
 *
 * Visibility gate: `is_active = true`. The special_offers table has no
 * `deleted_at` column — `is_active` is the sole visibility toggle,
 * confirmed from database.types.ts.
 *
 * Date range: `valid_from` and `valid_until` are nullable dates. When
 * both are null the offer is always active. When set, the offer is only
 * shown during its active window. The date comparison is done
 * server-side via PostgREST filter operators so the public site never
 * shows expired offers even if a cache is slightly stale.
 *
 * Note: the `icon` field stores a Font Awesome icon identifier
 * (e.g. "fa-percent") — the component renders it via
 * `<i className={\`fa-solid ${o.icon}\`} />`. A null icon simply
 * renders an empty icon slot, matching how the static data worked.
 */

export type PublicOffersErrorCode = "network_error" | "unexpected_error";

export interface PublicOffersError {
  code: PublicOffersErrorCode;
  message: string;
}

/** Exactly the fields the Offers section renders — nothing more. */
export interface PublicOffer {
  id: string;
  title: string;
  /** Maps to `description`. Nullable — renders as empty string if null. */
  desc: string | null;
  /** Nullable — renders as empty string if null. */
  tag: string | null;
  /** FA icon identifier e.g. "fa-percent". Nullable. */
  icon: string | null;
}

export type GetPublicOffersResult =
  | { success: true; data: PublicOffer[] }
  | { success: false; error: PublicOffersError };

/**
 * Fetches active special offers that are within their date window
 * (or have no date window set), ordered by display_order ASC then
 * created_at ASC as a tiebreaker.
 *
 * Date filtering logic:
 * - Rows where valid_from IS NULL OR valid_from <= today → not yet
 *   excluded by start date.
 * - Rows where valid_until IS NULL OR valid_until >= today → not yet
 *   expired.
 *
 * PostgREST doesn't support OR across columns natively in a single
 * filter chain, so we use .or() for each nullable date column to
 * achieve the "null means unbounded" semantics.
 */
export async function getPublicOffers(): Promise<GetPublicOffersResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    const { data, error } = await supabase
      .from("special_offers")
      .select("id, title, description, tag, icon")
      .eq("is_active", true)
      .or(`valid_from.is.null,valid_from.lte.${today}`)
      .or(`valid_until.is.null,valid_until.gte.${today}`)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return { success: false, error: mapPostgrestError(error) };
    }

    const offers: PublicOffer[] = data.map((row) => ({
      id: row.id,
      title: row.title,
      desc: row.description,
      tag: row.tag,
      icon: row.icon,
    }));

    return { success: true, data: offers };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapPostgrestError(error: PostgrestError): PublicOffersError {
  console.error("[offers.public.service] failed:", error.message);
  return {
    code: "unexpected_error",
    message: "We couldn't load offers right now.",
  };
}

function mapUnexpectedError(err: unknown): PublicOffersError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong loading offers.",
  };
}
