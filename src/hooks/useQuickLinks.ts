import { useCallback, useEffect, useState } from "react";

import {
  getQuickLinks,
  type FooterServiceError,
  type QuickLink,
} from "@/services/footer.service";

export interface UseQuickLinksResult {
  links: QuickLink[];
  isLoading: boolean;
  error: FooterServiceError | null;
  refetch: () => void;
}

export function useQuickLinks(): UseQuickLinksResult {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FooterServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getQuickLinks().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setLinks(result.data);
      } else {
        setError(result.error);
        setLinks([]);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { links, isLoading, error, refetch };
}
