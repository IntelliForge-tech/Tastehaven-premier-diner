import { useCallback, useEffect, useState } from "react";

import {
  getAbout,
  type AboutContent,
  type AboutServiceError,
} from "@/services/about.service";

export interface UseAboutResult {
  about: AboutContent | null;
  isLoading: boolean;
  error: AboutServiceError | null;
  refetch: () => void;
}

/**
 * Loads the about_settings singleton via about.service.ts.
 * Mirrors useHero() exactly: loading/error/data state + refetch trigger,
 * with cancellation on unmount via a `cancelled` flag.
 *
 * Returns `about: null` both while loading and when the row doesn't
 * exist yet — callers differentiate with `isLoading` and `error.code`.
 */
export function useAbout(): UseAboutResult {
  const [about, setAbout] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AboutServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getAbout().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setAbout(result.data);
      } else {
        // "not_found" is not a hard error on the public site — callers
        // show defaults. Admin page shows an error state instead.
        setError(result.error);
        setAbout(null);
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

  return { about, isLoading, error, refetch };
}
