import { useCallback, useEffect, useState } from "react";

import {
  getPublicTestimonials,
  type PublicTestimonial,
  type PublicTestimonialsError,
} from "@/services/testimonials.public.service";

export interface UsePublicTestimonialsResult {
  testimonials: PublicTestimonial[];
  isLoading: boolean;
  error: PublicTestimonialsError | null;
  refetch: () => void;
}

/**
 * Loads live testimonials for the public carousel via
 * testimonials.public.service.ts. Never imports Supabase directly.
 * Same loading/error/refetch/cancellation pattern as usePublicGallery.
 */
export function usePublicTestimonials(): UsePublicTestimonialsResult {
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PublicTestimonialsError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getPublicTestimonials().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setTestimonials(result.data);
        console.debug("[usePublicTestimonials] loaded", result.data.length, "testimonials", result.data);
      } else {
        setError(result.error);
        console.error("[usePublicTestimonials] error:", result.error);
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

  return { testimonials, isLoading, error, refetch };
}
