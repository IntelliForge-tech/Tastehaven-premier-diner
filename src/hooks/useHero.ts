import { useCallback, useEffect, useState } from "react";

import {
  getHero,
  type HeroContent,
  type HeroServiceError,
} from "@/services/hero.service";

export interface UseHeroResult {
  hero: HeroContent | null;
  isLoading: boolean;
  error: HeroServiceError | null;
  refetch: () => void;
}

/**
 * Loads the hero_settings singleton via hero.service.ts.
 * Mirrors useChef(), useOffer(), and the rest of the project's
 * single-record fetch hooks: loading/error/data state + refetch trigger,
 * with cancellation on unmount via a `cancelled` flag.
 *
 * Returns `hero: null` both while loading and when the row doesn't exist
 * yet — callers differentiate with `isLoading` and `error.code`.
 */
export function useHero(): UseHeroResult {
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<HeroServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getHero().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setHero(result.data);
      } else {
        // "not_found" is not a hard error on the public site — callers
        // show defaults. Admin page shows an error state instead.
        setError(result.error);
        setHero(null);
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

  return { hero, isLoading, error, refetch };
}
