import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ReservationStatusValue } from "@/services/reservations.service";

export interface ReservationHistoryEntry {
  id: string;
  reservationId: string;
  previousStatus: ReservationStatusValue | null;
  newStatus: ReservationStatusValue;
  changedBy: string;
  changedAt: string;
}

export type GetHistoryResult =
  | { success: true; data: ReservationHistoryEntry[] }
  | { success: false; error: { message: string } };

export async function getReservationHistory(reservationId: string): Promise<GetHistoryResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("reservation_status_log")
      .select("id, reservation_id, previous_status, new_status, changed_by, changed_at")
      .eq("reservation_id", reservationId)
      .order("changed_at", { ascending: false });

    if (error) {
      console.error("[reservation-history.service]", error.message);
      return { success: false, error: { message: "Couldn't load status history." } };
    }

    return {
      success: true,
      data: (data ?? []).map((row) => ({
        id: row.id,
        reservationId: row.reservation_id,
        previousStatus: row.previous_status as ReservationStatusValue | null,
        newStatus: row.new_status as ReservationStatusValue,
        changedBy: row.changed_by,
        changedAt: row.changed_at,
      })),
    };
  } catch {
    return { success: false, error: { message: "Couldn't load status history." } };
  }
}
