import { useCallback, useEffect, useState } from "react";

import {
  getReservationHistory,
  type ReservationHistoryEntry,
} from "@/services/reservation-history.service";

export function useReservationHistory(reservationId: string) {
  const [history, setHistory] = useState<ReservationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getReservationHistory(reservationId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setHistory(result.data);
      } else {
        setError(result.error.message);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reservationId, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { history, isLoading, error, refetch };
}
