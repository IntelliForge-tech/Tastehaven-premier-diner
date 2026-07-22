import { useCallback, useEffect, useState } from "react";

import {
  getOfferById,
  type OfferDetail,
  type OffersServiceError,
} from "@/services/offers.service";

export interface UseOfferResult {
  offer: OfferDetail | null;
  isLoading: boolean;
  error: OffersServiceError | null;
  refetch: () => void;
}

/**
 * Loads a single offer by id for the Edit page. Same shape as useChef()
 * and useGalleryItem() — loading/error/refetch, cancellation on unmount,
 * reloadToken for retry. No Supabase access here.
 */
export function useOffer(offerId: string): UseOfferResult {
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<OffersServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getOfferById(offerId).then((result) => {
      if (cancelled) return;

      if (result.success) {
        setOffer(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [offerId, reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  return { offer, isLoading, error, refetch };
}
