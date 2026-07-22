import { useEffect, useRef, useState } from "react";

import {
  updateTestimonial,
  type TestimonialsServiceError,
  type UpdateTestimonialInput,
} from "@/services/testimonials.service";

export type UpdateTestimonialOutcome =
  | { success: true }
  | { success: false; error: TestimonialsServiceError };

export interface UseUpdateTestimonialResult {
  isSubmitting: boolean;
  /** Updates the testimonial. Never throws — returns a typed result. */
  update: (id: string, input: UpdateTestimonialInput) => Promise<UpdateTestimonialOutcome>;
}

/** Mirrors useCreateTestimonial's shape exactly — just calls updateTestimonial() instead of create. */
export function useUpdateTestimonial(): UseUpdateTestimonialResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function update(
    id: string,
    input: UpdateTestimonialInput,
  ): Promise<UpdateTestimonialOutcome> {
    setIsSubmitting(true);

    try {
      const result = await updateTestimonial(id, input);

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

  return { isSubmitting, update };
}
