import { useEffect, useRef, useState } from "react";

import {
  updateOffer,
  type CreateOfferInput,
  type OffersServiceError,
} from "@/services/offers.service";

export type UpdateOfferOutcome =
  | { success: true }
  | { success: false; error: OffersServiceError };

export interface UseUpdateOfferResult {
  isSubmitting: boolean;
  /** Updates the offer record. Never throws. */
  submit: (id: string, input: CreateOfferInput) => Promise<UpdateOfferOutcome>;
}

/**
 * Wraps updateOffer() with loading state. Simpler than useUpdateChef()
 * or useUpdateGalleryItem() because special_offers has no image_url
 * column — no upload, no rollback logic needed. Mirrors useCreateOffer()
 * in shape.
 */
export function useUpdateOffer(): UseUpdateOfferResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function submit(id: string, input: CreateOfferInput): Promise<UpdateOfferOutcome> {
    setIsSubmitting(true);

    try {
      const result = await updateOffer(id, input);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }

  return { isSubmitting, submit };
}
