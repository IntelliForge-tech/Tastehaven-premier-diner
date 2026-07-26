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
  | "pending"
  | "confirmed"
  | "checked_in"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show";


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

/** Extended status transitions for Phase 13A. */
export const STATUS_TRANSITIONS_V2: Record<ReservationStatusValue, ReservationStatusValue[]> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["checked_in", "cancelled", "no_show"],
  checked_in: ["seated", "cancelled"],
  seated:     ["completed", "cancelled"],
  completed:  [],
  cancelled:  [],
  no_show:    [],
};

/** Human-readable labels for each status. */
export const STATUS_LABELS: Record<ReservationStatusValue, string> = {
  pending:    "Pending",
  confirmed:  "Confirmed",
  checked_in: "Checked In",
  seated:     "Seated",
  completed:  "Completed",
  cancelled:  "Cancelled",
  no_show:    "No Show",
};

/** Tailwind color classes for each status. */
export const STATUS_COLORS: Record<ReservationStatusValue, string> = {
  pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  checked_in: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  seated:     "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  completed:  "bg-secondary text-secondary-foreground",
  cancelled:  "bg-destructive/10 text-destructive",
  no_show:    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

/** Terminal statuses — no further transitions allowed. */
export const TERMINAL_STATUSES: ReservationStatusValue[] = ["completed", "cancelled", "no_show"];

/** Extended reservation item including Phase 13A fields. */
export interface ReservationItemV2 extends ReservationItem {
  tableNumber: string | null;
  staffNotes: string | null;
  tags: string[] | null;
  source: string;
  updatedAt: string;
}

export interface ReservationFilters {
  status?: ReservationStatusValue | "all";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  minGuests?: number;
  maxGuests?: number;
  tableNumber?: string;
}

export interface GetReservationsV2Result {
  success: true;
  data: ReservationItemV2[];
  total: number;
}

export async function getReservationsV2(
  filters: ReservationFilters = {},
  page = 1,
  pageSize = 50,
): Promise<GetReservationsV2Result | { success: false; error: ReservationsServiceError }> {
  try {
    const supabase = getSupabaseBrowserClient();

    let query = supabase
      .from("reservations")
      .select(
        "id, customer_name, email, phone, party_size, reservation_date, reservation_time, special_request, status, confirmed_at, table_number, staff_notes, tags, source, created_at, updated_at",
        { count: "exact" },
      );

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.dateFrom) query = query.gte("reservation_date", filters.dateFrom);
    if (filters.dateTo) query = query.lte("reservation_date", filters.dateTo);
    if (filters.minGuests) query = query.gte("party_size", filters.minGuests);
    if (filters.maxGuests) query = query.lte("party_size", filters.maxGuests);
    if (filters.tableNumber) query = query.eq("table_number", filters.tableNumber);
    if (filters.search) {
      query = query.or(
        `customer_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,id.ilike.%${filters.search}%`,
      );
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order("reservation_date", { ascending: false })
      .order("reservation_time", { ascending: false })
      .range(from, to);

    if (error) return { success: false, error: mapPostgrestError(error) };

    return {
      success: true,
      data: (data ?? []).map(mapToItemV2),
      total: count ?? 0,
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function mapToItemV2(row: {
  id: string; customer_name: string; email: string; phone: string;
  party_size: number; reservation_date: string; reservation_time: string;
  special_request: string | null; status: string; confirmed_at: string | null;
  table_number: string | null; staff_notes: string | null; tags: string[] | null;
  source: string; created_at: string; updated_at: string;
}): ReservationItemV2 {
  return {
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
    tableNumber: row.table_number,
    staffNotes: row.staff_notes,
    tags: row.tags,
    source: row.source ?? "website",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Update a reservation with full detail fields (table, staff notes, etc.). */
export async function updateReservationDetail(
  id: string,
  updates: {
    tableNumber?: string | null;
    staffNotes?: string | null;
    tags?: string[] | null;
    adminNotes?: string | null;
  },
): Promise<UpdateReservationStatusResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("reservations")
      .update({
        table_number: updates.tableNumber,
        staff_notes: updates.staffNotes,
        tags: updates.tags,
        admin_notes: updates.adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: { code: "unexpected_error", message: "Couldn't update reservation." } };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedErrorDelete(err) };
  }
}

/** Bulk status update for multiple reservations. */
export async function bulkUpdateStatus(
  ids: string[],
  newStatus: ReservationStatusValue,
  changedByUserId: string,
): Promise<UpdateReservationStatusResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const timestampCol: Partial<Record<string, string>> = {};
    if (newStatus === "confirmed") timestampCol.confirmed_at = new Date().toISOString();
    if (newStatus === "checked_in") timestampCol.checked_in_at = new Date().toISOString();
    if (newStatus === "seated") timestampCol.seated_at = new Date().toISOString();
    if (newStatus === "completed") timestampCol.completed_at = new Date().toISOString();
    if (newStatus === "cancelled") timestampCol.cancelled_at = new Date().toISOString();
    if (newStatus === "no_show") timestampCol.no_show_at = new Date().toISOString();

    const { error } = await supabase
      .from("reservations")
      .update({ status: newStatus, ...timestampCol, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      return { success: false, error: { code: "unexpected_error", message: "Bulk update failed." } };
    }

    // Log each change
    const now = new Date().toISOString();
    await supabase.from("reservation_status_log").insert(
      ids.map((id) => ({
        reservation_id: id,
        new_status: newStatus,
        changed_by: changedByUserId,
        changed_at: now,
      })),
    );

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedErrorDelete(err) };
  }
}

/** Bulk delete reservations (terminal statuses only). */
export async function bulkDeleteReservations(
  ids: string[],
): Promise<DeleteReservationResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("reservations").delete().in("id", ids);
    if (error) {
      return { success: false, error: { code: "unexpected_error", message: "Bulk delete failed." } };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedErrorDelete(err) };
  }
}

/** Analytics query — counts by status + additional metrics. */
export interface ReservationAnalytics {
  today: number;
  tomorrow: number;
  thisWeek: number;
  thisMonth: number;
  pending: number;
  confirmed: number;
  checkedIn: number;
  seated: number;
  completed: number;
  cancelled: number;
  noShow: number;
  avgGuests: number;
  cancellationRate: number;
  noShowRate: number;
  peakHour: string | null;
}

export async function getReservationAnalytics(): Promise<
  { success: true; data: ReservationAnalytics } | { success: false; error: ReservationsServiceError }
> {
  try {
    const supabase = getSupabaseBrowserClient();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().split("T")[0];
    const monthStart = new Date(new Date().setDate(1)).toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("reservations")
      .select("status, party_size, reservation_date, reservation_time");

    if (error) return { success: false, error: mapPostgrestError(error) };

    const all = data ?? [];
    const total = all.length;
    const counts: Record<string, number> = {};
    let totalGuests = 0;
    const hourCounts: Record<string, number> = {};

    for (const r of all) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
      totalGuests += r.party_size ?? 0;
      const hour = r.reservation_time?.split(":")[0] ?? "?";
      hourCounts[hour] = (hourCounts[hour] ?? 0) + 1;
    }

    const terminal = (counts["completed"] ?? 0) + (counts["cancelled"] ?? 0) + (counts["no_show"] ?? 0);
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return {
      success: true,
      data: {
        today: all.filter((r) => r.reservation_date === today).length,
        tomorrow: all.filter((r) => r.reservation_date === tomorrow).length,
        thisWeek: all.filter((r) => r.reservation_date >= weekStart).length,
        thisMonth: all.filter((r) => r.reservation_date >= monthStart).length,
        pending: counts["pending"] ?? 0,
        confirmed: counts["confirmed"] ?? 0,
        checkedIn: counts["checked_in"] ?? 0,
        seated: counts["seated"] ?? 0,
        completed: counts["completed"] ?? 0,
        cancelled: counts["cancelled"] ?? 0,
        noShow: counts["no_show"] ?? 0,
        avgGuests: total > 0 ? Math.round((totalGuests / total) * 10) / 10 : 0,
        cancellationRate: terminal > 0 ? Math.round(((counts["cancelled"] ?? 0) / terminal) * 100) : 0,
        noShowRate: terminal > 0 ? Math.round(((counts["no_show"] ?? 0) / terminal) * 100) : 0,
        peakHour: peakHour ? formatPeakHour(peakHour) : null,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

function formatPeakHour(h: string): string {
  const n = parseInt(h, 10);
  const suffix = n >= 12 ? "PM" : "AM";
  const h12 = n === 0 ? 12 : n > 12 ? n - 12 : n;
  return `${h12}:00 ${suffix}`;
}
