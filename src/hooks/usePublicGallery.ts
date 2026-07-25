import { useCallback, useEffect, useState } from "react";

import {
  getPublicGalleryImages,
  type PublicGalleryImage,
  type PublicGalleryServiceError,
} from "@/services/gallery.public.service";

export interface UsePublicGalleryResult {
  images: PublicGalleryImage[];
  isLoading: boolean;
  error: PublicGalleryServiceError | null;
  refetch: () => void;
}

/**
 * Loads live gallery images for the public Gallery section via
 * gallery.public.service.ts. Never imports Supabase directly.
 *
 * Same loading/error/refetch/cancellation pattern as every other
 * listing hook in this codebase (useReservations, useChefs, etc.).
 */
export function usePublicGallery(): UsePublicGalleryResult {
  const [images, setImages] = useState<PublicGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<PublicGalleryServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getPublicGalleryImages().then((result) => {
      if (cancelled) return;

      if (result.success) {
        setImages(result.data);
        console.debug("[usePublicGallery] loaded", result.data.length, "images", result.data);
      } else {
        setError(result.error);
        console.error("[usePublicGallery] error:", result.error);
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

  return { images, isLoading, error, refetch };
}
