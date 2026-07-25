import { useCallback, useEffect, useState } from "react";

import {
  getPublicOffers,
  type PublicOffer,
  type PublicOffersError,
} from "@/services/offers.public.service";

export interface UsePublicOffersResult {
  offers: PublicOffer[];
  isLoading: boolean;
  error: PublicOffersError | null;
  refetch: () => void;
}

/**
 * Loads live special offers for the public Offers section via
 * offers.public.service.ts. Never imports Supabase directly.
 * Same loading/error/refetch/cancellation pattern as the other public
 * hooks in this codebase.
 */
export function usePublicOffers(): UsePublicOffersResult {
  const [offers, setOffers] = useState<PublicOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PublicOffersError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getPublicOffers().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setOffers(result.data);
        console.debug("[usePublicOffers] loaded", result.data.length, "offers", result.data);
      } else {
        setError(result.error);
        console.error("[usePublicOffers] error:", result.error);
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

  return { offers, isLoading, error, refetch };
}
