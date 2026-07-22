import { useEffect, useRef, useState } from "react";

import {
  updateReservationStatus,
  type ReservationStatusValue,
  type ReservationsServiceError,
} from "@/services/reservations.service";

export type UpdateReservationStatusOutcome =
  { success: true } | { success: false; error: ReservationsServiceError };

export interface UseUpdateReservationStatusResult {
  isUpdating: boolean;
  /** Updates the status. Never throws. */
  updateStatus: (
    reservationId: string,
    newStatus: ReservationStatusValue,
    currentStatus: ReservationStatusValue,
    changedByUserId: string,
  ) => Promise<UpdateReservationStatusOutcome>;
}

/**
 * Orchestrates the status-update flow. Mirrors useUpdateOffer() and
 * useUpdateChef() — owns the loading state, calls the service, returns
 * a typed outcome. Never touches Supabase directly.
 */
export function useUpdateReservationStatus(): UseUpdateReservationStatusResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateStatus(
    reservationId: string,
    newStatus: ReservationStatusValue,
    currentStatus: ReservationStatusValue,
    changedByUserId: string,
  ): Promise<UpdateReservationStatusOutcome> {
    setIsUpdating(true);

    try {
      const result = await updateReservationStatus(
        reservationId,
        newStatus,
        currentStatus,
        changedByUserId,
      );

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsUpdating(false);
      }
    }
  }

  return { isUpdating, updateStatus };
}
