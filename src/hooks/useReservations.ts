import { useCallback, useEffect, useState } from "react";

import {
  getReservations,
  type ReservationItem,
  type ReservationsServiceError,
} from "@/services/reservations.service";

export interface UseReservationsResult {
  items: ReservationItem[];
  isLoading: boolean;
  error: ReservationsServiceError | null;
  refetch: () => void;
}

/**
 * Loads all reservations via reservations.service.ts. Same
 * loading/error/refetch shape and cancellation-on-unmount pattern as
 * every other listing hook in this codebase. No Supabase access here.
 */
export function useReservations(): UseReservationsResult {
  const [items, setItems] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ReservationsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getReservations().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setItems(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  return { items, isLoading, error, refetch };
}
