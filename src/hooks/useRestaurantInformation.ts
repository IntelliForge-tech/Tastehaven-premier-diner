import { useCallback, useEffect, useState } from "react";

import {
  getRestaurantInformation,
  type RestaurantInfoServiceError,
  type RestaurantInformationData,
} from "@/services/restaurant-information.service";

export interface UseRestaurantInformationResult {
  data: RestaurantInformationData | null;
  isLoading: boolean;
  error: RestaurantInfoServiceError | null;
  refetch: () => void;
}

/**
 * Loads the restaurant_info singleton and opening_hours rows.
 * Mirrors useHero() / useAbout() exactly: loading/error/data state +
 * refetch trigger, with cancellation on unmount via a `cancelled` flag.
 */
export function useRestaurantInformation(): UseRestaurantInformationResult {
  const [data, setData] = useState<RestaurantInformationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<RestaurantInfoServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getRestaurantInformation().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error);
        setData(null);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { data, isLoading, error, refetch };
}
