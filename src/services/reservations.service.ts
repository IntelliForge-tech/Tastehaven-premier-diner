import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Reservations service.
 *
 * Phase 11A: read-only listing. UI components never import the Supabase
 * client or `database.types.ts` directly — they call this service's
 * functions and get back small, UI-safe result types instead.
 *
 * Schema notes (confirmed from database.types.ts):
 * - `reservation_date` and `reservation_time` are separate string columns.
 * - `status` is a five-value enum: pending | confirmed | completed |
 *   cancelled | no_show.
 * - `admin_notes` is internal-only and deliberately excluded from the
 *   listing type (it will be shown only on a detail/edit page in a
 *   later phase).
 * - `special_request` is nullable — shown only when present.
 * - No `deleted_at` column — reservations are hard-deleted if removed.
 * - Sorted by reservation_date DESC, then reservation_time DESC, so the
 *   most upcoming/recent reservations appear at the top.
 */

export type ReservationsServiceErrorCode = "network_error" | "not_found" | "unexpected_error";

export interface ReservationsServiceError {
  code: ReservationsServiceErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase/Postgres error message. */
  message: string;
}

/** All possible reservation status values, matching the DB enum exactly. */
export type ReservationStatusValue =
  "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export interface ReservationItem {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  specialRequest: string | null;
  status: ReservationStatusValue;
  confirmedAt: string | null;
  createdAt: string;
}

export type GetReservationsResult =
  { success: true; data: ReservationItem[] } | { success: false; error: ReservationsServiceError };

/**
 * Fetches all reservations ordered by reservation_date DESC then
 * reservation_time DESC (most upcoming/recent first). Returns all
 * statuses — the admin listing shows the full picture; status filtering
 * is a later-phase feature. `admin_notes` is intentionally excluded —
 * it's internal and only relevant on the detail/edit page.
 */
export async function getReservations(): Promise<GetReservationsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("reservations")
      .select(
        "id, customer_name, email, phone, party_size, reservation_date, reservation_time, special_request, status, confirmed_at, created_at",
      )
      .order("reservation_date", { ascending: false })
      .order("reservation_time", { ascending: false });

    if (error) {
      return { success: false, error: mapPostgrestError(error) };
    }

    const items: ReservationItem[] = data.map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      email: row.email,
      phone: row.phone,
      partySize: row.party_size,
      reservationDate: row.reservation_date,
      reservationTime: row.reservation_time,
      specialRequest: row.special_request,
      status: row.status as ReservationStatusValue,
      confirmedAt: row.confirmed_at,
      createdAt: row.created_at,
    }));

    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapPostgrestError(error: PostgrestError): ReservationsServiceError {
  console.error("[reservations.service] getReservations failed:", error.message);
  return {
    code: "unexpected_error",
    message: "We couldn't load reservations right now. Please try again.",
  };
}

function mapUnexpectedError(err: unknown): ReservationsServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong loading reservations. Please try again.",
  };
}

// ============================================================================
// Phase 11B — Reservation Detail
// ============================================================================

/**
 * Full reservation model — includes all columns from the Row type,
 * including admin_notes and updated_at which are excluded from
 * ReservationItem (the listing type) to keep the table view minimal.
 */
export interface ReservationDetail {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  specialRequest: string | null;
  status: ReservationStatusValue;
  adminNotes: string | null;
  confirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GetReservationByIdResult =
  { success: true; data: ReservationDetail } | { success: false; error: ReservationsServiceError };

/**
 * Fetches a single reservation by id for the Detail page. A missing
 * row is reported as "not_found" — the detail page's only sensible
 * response is a message and navigation back to the list.
 */
export async function getReservationById(id: string): Promise<GetReservationByIdResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("reservations")
      .select(
        "id, customer_name, email, phone, party_size, reservation_date, reservation_time, special_request, status, admin_notes, confirmed_at, created_at, updated_at",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { success: false, error: mapPostgrestErrorDetail(error) };
    }

    if (!data) {
      return {
        success: false,
        error: {
          code: "not_found",
          message: "This reservation no longer exists. It may have already been deleted.",
        },
      };
    }

    return {
      success: true,
      data: {
        id: data.id,
        customerName: data.customer_name,
        email: data.email,
        phone: data.phone,
        partySize: data.party_size,
        reservationDate: data.reservation_date,
        reservationTime: data.reservation_time,
        specialRequest: data.special_request,
        status: data.status as ReservationStatusValue,
        adminNotes: data.admin_notes,
        confirmedAt: data.confirmed_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedErrorDetail(err) };
  }
}

function mapPostgrestErrorDetail(error: PostgrestError): ReservationsServiceError {
  console.error("[reservations.service] getReservationById failed:", error.message);
  return {
    code: "unexpected_error",
    message: "We couldn't load this reservation right now. Please try again.",
  };
}

function mapUnexpectedErrorDetail(err: unknown): ReservationsServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong loading this reservation. Please try again.",
  };
}

// ============================================================================
// Phase 11C — Status Update & Delete
// ============================================================================

/**
 * Valid status transitions. The terminal states (completed, cancelled,
 * no_show) have no allowed next states — any attempt to transition from
 * them is rejected client-side before reaching Supabase.
 *
 * Enforced both here (service layer) and in the UI (the action buttons
 * only render for states that have allowed transitions).
 */
export const STATUS_TRANSITIONS: Record<ReservationStatusValue, ReservationStatusValue[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export type UpdateReservationStatusResult =
  { success: true } | { success: false; error: ReservationsServiceError };

/**
 * Updates the status of a reservation and inserts a row in the
 * `reservation_status_log` table — which the schema requires and which
 * enforces an audit trail. `changed_by` must be the authenticated
 * admin's user id.
 *
 * Invalid transitions are rejected before touching the DB (see
 * STATUS_TRANSITIONS). Hard-codes `new Date().toISOString()` for
 * `changed_at` because the column has a DB default but the Insert type
 * makes it optional rather than generated — either works.
 */
export async function updateReservationStatus(
  reservationId: string,
  newStatus: ReservationStatusValue,
  currentStatus: ReservationStatusValue,
  changedByUserId: string,
): Promise<UpdateReservationStatusResult> {
  const allowed = STATUS_TRANSITIONS[currentStatus];
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: {
        code: "unexpected_error",
        message: `Cannot change status from "${currentStatus}" to "${newStatus}".`,
      },
    };
  }

  try {
    const supabase = getSupabaseBrowserClient();

    // Update the reservation row first.
    const updatePayload =
      newStatus === "confirmed"
        ? ({ status: newStatus, confirmed_at: new Date().toISOString() } as const)
        : ({ status: newStatus } as const);

    const { error: updateError } = await supabase
      .from("reservations")
      .update(updatePayload)
      .eq("id", reservationId);

    if (updateError) {
      return {
        success: false,
        error: {
          code: "unexpected_error",
          message: "We couldn't update this reservation's status. Please try again.",
        },
      };
    }

    // Insert an audit log entry. Best-effort — a failure here doesn't
    // roll back the status update (the row is already changed), but we
    // log the error for debugging.
    const { error: logError } = await supabase.from("reservation_status_log").insert({
      reservation_id: reservationId,
      previous_status: currentStatus,
      new_status: newStatus,
      changed_by: changedByUserId,
    });

    if (logError) {
      console.error("[reservations.service] status log insert failed:", logError.message);
      // Still return success — the reservation itself updated correctly.
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: mapUnexpectedErrorDelete(err),
    };
  }
}

export type DeleteReservationResult =
  { success: true } | { success: false; error: ReservationsServiceError };

/**
 * Hard-deletes a reservation row. The `reservations` table has no
 * `deleted_at` column (confirmed from database.types.ts), so this is a
 * real DELETE — unlike most other modules in this project that use soft
 * delete. Only allowed for terminal statuses (completed, cancelled,
 * no_show) — enforced both here and in the UI.
 */
export async function deleteReservation(
  reservationId: string,
  currentStatus: ReservationStatusValue,
): Promise<DeleteReservationResult> {
  const deletableStatuses: ReservationStatusValue[] = ["completed", "cancelled", "no_show"];
  if (!deletableStatuses.includes(currentStatus)) {
    return {
      success: false,
      error: {
        code: "unexpected_error",
        message: `Only completed, cancelled, or no-show reservations can be deleted.`,
      },
    };
  }

  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("reservations").delete().eq("id", reservationId);

    if (error) {
      return {
        success: false,
        error: {
          code: "unexpected_error",
          message: "We couldn't delete this reservation. Please try again.",
        },
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: mapUnexpectedErrorDelete(err),
    };
  }
}

function mapUnexpectedErrorDelete(err: unknown): ReservationsServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong. Please try again.",
  };
}
