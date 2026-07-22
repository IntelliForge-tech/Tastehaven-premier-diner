import { useEffect, useRef, useState } from "react";

import {
  createOffer,
  type CreateOfferInput,
  type OffersServiceError,
} from "@/services/offers.service";

export type CreateOfferOutcome = { success: true } | { success: false; error: OffersServiceError };

export interface UseCreateOfferResult {
  isSubmitting: boolean;
  /** Inserts the offer. Never throws — returns a typed result instead. */
  submit: (input: CreateOfferInput) => Promise<CreateOfferOutcome>;
}

/**
 * Owns the submission loading state and calls createOffer() from the
 * service layer. OfferForm calls this instead of touching
 * offers.service.ts (or Supabase) directly, keeping the
 * UI → Hook → Service → Supabase chain intact. Mirrors
 * useCreateTestimonial() and useCreateChef() exactly.
 */
export function useCreateOffer(): UseCreateOfferResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function submit(input: CreateOfferInput): Promise<CreateOfferOutcome> {
    setIsSubmitting(true);

    try {
      const result = await createOffer(input);

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
