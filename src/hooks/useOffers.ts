import { useCallback, useEffect, useState } from "react";

import {
  getOffers,
  type OfferItem,
  type OffersServiceError,
} from "@/services/offers.service";

export interface UseOffersResult {
  items: OfferItem[];
  isLoading: boolean;
  error: OffersServiceError | null;
  /** Re-runs the fetch (e.g. from an error state's "Try again" action). */
  refetch: () => void;
}

/**
 * Loads special offers via offers.service.ts and exposes
 * loading/error/data state plus a refetch trigger. Keeps all fetching
 * logic out of the Offers page — mirrors useChefs(), useMenuItems(),
 * useGalleryItems(), and useTestimonials() exactly.
 */
export function useOffers(): UseOffersResult {
  const [items, setItems] = useState<OfferItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<OffersServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getOffers().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setItems(result.data);
      } else {
        setError(result.error);
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

  return { items, isLoading, error, refetch };
}
