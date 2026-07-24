import { useCallback, useEffect, useState } from "react";

import {
  getFooterSettings,
  type FooterServiceError,
  type FooterSettings,
} from "@/services/footer.service";

export interface UseFooterSettingsResult {
  settings: FooterSettings | null;
  isLoading: boolean;
  error: FooterServiceError | null;
  refetch: () => void;
}

export function useFooterSettings(): UseFooterSettingsResult {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FooterServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getFooterSettings().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setSettings(result.data);
      } else {
        setError(result.error);
        setSettings(null);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { settings, isLoading, error, refetch };
}
