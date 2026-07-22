import { useEffect, useRef, useState } from "react";

import {
  deleteReservation,
  type ReservationStatusValue,
  type ReservationsServiceError,
} from "@/services/reservations.service";

export type DeleteReservationOutcome =
  { success: true } | { success: false; error: ReservationsServiceError };

export interface UseDeleteReservationResult {
  isDeleting: boolean;
  /** Hard-deletes the reservation. Never throws. */
  deleteItem: (
    reservationId: string,
    currentStatus: ReservationStatusValue,
  ) => Promise<DeleteReservationOutcome>;
}

/**
 * Orchestrates the delete flow. Mirrors useDeleteOffer() and
 * useDeleteChef() — owns the loading state, calls the service, returns
 * a typed outcome. Never touches Supabase directly.
 */
export function useDeleteReservation(): UseDeleteReservationResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function deleteItem(
    reservationId: string,
    currentStatus: ReservationStatusValue,
  ): Promise<DeleteReservationOutcome> {
    setIsDeleting(true);

    try {
      const result = await deleteReservation(reservationId, currentStatus);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  }

  return { isDeleting, deleteItem };
}
