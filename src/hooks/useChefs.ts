import { useCallback, useEffect, useState } from "react";

import {
  getChefs,
  type ChefItem,
  type ChefsServiceError,
} from "@/services/chefs.service";

export interface UseChefsResult {
  items: ChefItem[];
  isLoading: boolean;
  error: ChefsServiceError | null;
  /** Re-runs the fetch (e.g. from an error state's "Try again" action). */
  refetch: () => void;
}

/**
 * Loads chef profiles via chefs.service.ts and exposes
 * loading/error/data state plus a refetch trigger. Keeps all fetching
 * logic out of the Chefs page component itself — same shape as
 * useMenuItems(), useGalleryItems(), and useTestimonials().
 */
export function useChefs(): UseChefsResult {
  const [items, setItems] = useState<ChefItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ChefsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getChefs().then((result) => {
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
    setReloadToken((token) => token + 1);
  }, []);

  return { items, isLoading, error, refetch };
}
