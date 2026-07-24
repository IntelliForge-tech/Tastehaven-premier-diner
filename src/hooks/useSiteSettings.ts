import { useCallback, useEffect, useState } from "react";

import {
  getSiteSettings,
  type SiteSettings,
  type SiteSettingsError,
} from "@/services/site-settings.service";

export interface UseSiteSettingsResult {
  siteSettings: SiteSettings | null;
  isLoading: boolean;
  error: SiteSettingsError | null;
  refetch: () => void;
}

/**
 * Loads the site_settings singleton via site-settings.service.ts.
 * Mirrors useHero() and useAbout() exactly: loading/error/data state
 * + refetch trigger with cancellation on unmount.
 */
export function useSiteSettings(): UseSiteSettingsResult {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SiteSettingsError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getSiteSettings().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setSiteSettings(result.data);
      } else {
        setError(result.error);
        setSiteSettings(null);
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

  return { siteSettings, isLoading, error, refetch };
}
