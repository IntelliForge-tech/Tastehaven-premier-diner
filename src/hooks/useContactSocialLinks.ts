import { useCallback, useEffect, useState } from "react";

import {
  getSocialLinks,
  type SocialLinksData,
  type SocialLinksError,
} from "@/services/social-links.service";

export interface UseContactSocialLinksResult {
  socialLinks: SocialLinksData | null;
  isLoading: boolean;
  error: SocialLinksError | null;
  refetch: () => void;
}

export function useContactSocialLinks(): UseContactSocialLinksResult {
  const [socialLinks, setSocialLinks] = useState<SocialLinksData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<SocialLinksError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getSocialLinks().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setSocialLinks(result.data);
      } else {
        setError(result.error);
        setSocialLinks(null);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { socialLinks, isLoading, error, refetch };
}
