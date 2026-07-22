import { useEffect, useRef, useState } from "react";

import {
  deleteOffer,
  type OffersServiceError,
} from "@/services/offers.service";

export type DeleteOfferOutcome =
  | { success: true }
  | { success: false; error: OffersServiceError };

export interface UseDeleteOfferResult {
  isDeleting: boolean;
  /** Hard-deletes the offer. Never throws. */
  deleteItem: (id: string) => Promise<DeleteOfferOutcome>;
}

/**
 * Wraps deleteOffer() with loading state. No Storage cleanup (no
 * image_url on special_offers) — the simplest delete hook in this
 * codebase so far. Mirrors the shape of useDeleteChef().
 */
export function useDeleteOffer(): UseDeleteOfferResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function deleteItem(id: string): Promise<DeleteOfferOutcome> {
    setIsDeleting(true);

    try {
      const result = await deleteOffer(id);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  }

  return { isDeleting, deleteItem };
}
