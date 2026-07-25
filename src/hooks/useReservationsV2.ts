import { useCallback, useEffect, useState } from "react";

import {
  getReservationsV2,
  type ReservationFilters,
  type ReservationItemV2,
  type ReservationsServiceError,
} from "@/services/reservations.service";

export interface UseReservationsV2Result {
  items: ReservationItemV2[];
  total: number;
  isLoading: boolean;
  error: ReservationsServiceError | null;
  refetch: () => void;
}

export function useReservationsV2(
  filters: ReservationFilters = {},
  page = 1,
  pageSize = 50,
): UseReservationsV2Result {
  const [items, setItems] = useState<ReservationItemV2[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ReservationsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getReservationsV2(filters, page, pageSize).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setItems(result.data);
        setTotal(result.total);
      } else {
        setError(result.error);
        setItems([]);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, page, pageSize, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { items, total, isLoading, error, refetch };
}
