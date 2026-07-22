import { useCallback, useEffect, useState } from "react";

import {
  getTestimonials,
  type TestimonialItem,
  type TestimonialsServiceError,
} from "@/services/testimonials.service";

export interface UseTestimonialsResult {
  items: TestimonialItem[];
  isLoading: boolean;
  error: TestimonialsServiceError | null;
  /** Re-runs the fetch (e.g. from an error state's "Try again" action). */
  refetch: () => void;
}

/**
 * Loads testimonials via testimonials.service.ts and exposes
 * loading/error/data state plus a refetch trigger. Keeps all fetching
 * logic out of the Testimonials page component itself — same shape as
 * useMenuItems() and useGalleryItems().
 */
export function useTestimonials(): UseTestimonialsResult {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<TestimonialsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getTestimonials().then((result) => {
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
