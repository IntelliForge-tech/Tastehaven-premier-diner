import { useEffect, useRef, useState } from "react";

import {
  createTestimonial,
  type CreateTestimonialInput,
  type TestimonialsServiceError,
} from "@/services/testimonials.service";

export type CreateTestimonialOutcome =
  | { success: true }
  | { success: false; error: TestimonialsServiceError };

export interface UseCreateTestimonialResult {
  isSubmitting: boolean;
  /** Inserts the testimonial. Never throws — returns a typed result instead. */
  submit: (input: CreateTestimonialInput) => Promise<CreateTestimonialOutcome>;
}

/**
 * Owns the submission loading state and calls createTestimonial() from
 * the service layer. No image upload step — testimonials use an initial
 * avatar derived from the customer name. Mirrors useCreateMenuItem()'s
 * shape exactly, just without the upload orchestration.
 *
 * TestimonialForm calls this instead of touching testimonials.service.ts
 * (or Supabase) directly, keeping the UI → Hook → Service → Supabase
 * chain intact.
 */
export function useCreateTestimonial(): UseCreateTestimonialResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function submit(input: CreateTestimonialInput): Promise<CreateTestimonialOutcome> {
    setIsSubmitting(true);

    try {
      const result = await createTestimonial(input);

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
