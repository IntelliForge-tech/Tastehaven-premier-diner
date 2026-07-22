import { useCallback, useEffect, useState } from "react";

import {
  getGalleryItemById,
  type GalleryItemDetail,
  type GalleryServiceError,
} from "@/services/gallery.service";

export interface UseGalleryItemResult {
  item: GalleryItemDetail | null;
  isLoading: boolean;
  error: GalleryServiceError | null;
  /** Re-runs the fetch (e.g. from an error state's "Try again" action). */
  refetch: () => void;
}

/**
 * Loads a single gallery image by id via gallery.service.ts, for the
 * Edit page's default form values. Not explicitly listed in Phase 7C's
 * hook file list, but required by its own Edit Page requirement ("Load
 * gallery image by id") — mirrors useMenuItem()'s loading/error/refetch
 * shape exactly, the same supporting piece Menu's own Edit page needed.
 */
export function useGalleryItem(imageId: string): UseGalleryItemResult {
  const [item, setItem] = useState<GalleryItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<GalleryServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getGalleryItemById(imageId).then((result) => {
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
  }, [imageId, reloadToken]);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  return { item, isLoading, error, refetch };
}
