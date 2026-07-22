import { useCallback, useEffect, useState } from "react";

import {
  getChefById,
  type ChefDetail,
  type ChefsServiceError,
} from "@/services/chefs.service";

export interface UseChefResult {
  chef: ChefDetail | null;
  isLoading: boolean;
  error: ChefsServiceError | null;
  refetch: () => void;
}

/**
 * Loads a single chef by id via chefs.service.ts, for the Edit page's
 * default form values. Mirrors useGalleryItem() and useMenuItem() exactly:
 * loading/error/refetch shape, cancellation on unmount, reloadToken
 * for the retry button — no Supabase access here.
 */
export function useChef(chefId: string): UseChefResult {
  const [chef, setChef] = useState<ChefDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ChefsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getChefById(chefId).then((result) => {
      if (cancelled) return;

      if (result.success) {
        setChef(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [chefId, reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { chef, isLoading, error, refetch };
}
