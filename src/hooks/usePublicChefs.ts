import { useCallback, useEffect, useState } from "react";

import {
  getPublicChefs,
  type PublicChef,
  type PublicChefsError,
} from "@/services/chefs.public.service";

export interface UsePublicChefsResult {
  chefs: PublicChef[];
  isLoading: boolean;
  error: PublicChefsError | null;
  refetch: () => void;
}

/**
 * Loads live chef profiles for the public Chefs section via
 * chefs.public.service.ts. Never imports Supabase directly.
 * Same loading/error/refetch/cancellation pattern as usePublicGallery
 * and usePublicTestimonials.
 */
export function usePublicChefs(): UsePublicChefsResult {
  const [chefs, setChefs] = useState<PublicChef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PublicChefsError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getPublicChefs().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setChefs(result.data);
        console.debug("[usePublicChefs] loaded", result.data.length, "chefs", result.data);
      } else {
        setError(result.error);
        console.error("[usePublicChefs] error:", result.error);
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

  return { chefs, isLoading, error, refetch };
}
