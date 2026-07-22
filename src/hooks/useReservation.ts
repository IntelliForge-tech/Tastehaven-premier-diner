import { useCallback, useEffect, useState } from "react";

import {
  getReservationById,
  type ReservationDetail,
  type ReservationsServiceError,
} from "@/services/reservations.service";

export interface UseReservationResult {
  reservation: ReservationDetail | null;
  isLoading: boolean;
  error: ReservationsServiceError | null;
  refetch: () => void;
}

/**
 * Loads a single reservation by id for the Detail page. Same
 * loading/error/refetch/cancellation pattern as useChef(), useOffer(),
 * and every other single-item hook in this codebase. No Supabase access.
 */
export function useReservation(reservationId: string): UseReservationResult {
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ReservationsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getReservationById(reservationId).then((result) => {
      if (cancelled) return;

      if (result.success) {
        setReservation(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reservationId, reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  return { reservation, isLoading, error, refetch };
}
