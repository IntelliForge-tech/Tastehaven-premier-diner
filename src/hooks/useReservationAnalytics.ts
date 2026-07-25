import { useCallback, useEffect, useState } from "react";

import {
  getReservationAnalytics,
  type ReservationAnalytics,
} from "@/services/reservations.service";

export function useReservationAnalytics() {
  const [analytics, setAnalytics] = useState<ReservationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getReservationAnalytics().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error.message);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { analytics, isLoading, error, refetch };
}
