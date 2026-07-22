import { useCallback, useEffect, useState } from "react";

import {
  getTestimonialById,
  type TestimonialDetail,
  type TestimonialsServiceError,
} from "@/services/testimonials.service";

export interface UseTestimonialResult {
  item: TestimonialDetail | null;
  isLoading: boolean;
  error: TestimonialsServiceError | null;
  refetch: () => void;
}

/** Loads a single testimonial by id for the Edit page's default form values. */
export function useTestimonial(testimonialId: string): UseTestimonialResult {
  const [item, setItem] = useState<TestimonialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<TestimonialsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getTestimonialById(testimonialId).then((result) => {
      if (cancelled) return;

      if (result.success) {
        setItem(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [testimonialId, reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((t) => t + 1);
  }, []);

  return { item, isLoading, error, refetch };
}
