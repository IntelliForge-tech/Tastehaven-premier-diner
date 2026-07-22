import { useCallback, useEffect, useState } from "react";

import {
  getGalleryItems,
  type GalleryImageItem,
  type GalleryServiceError,
} from "@/services/gallery.service";

export interface UseGalleryItemsResult {
  items: GalleryImageItem[];
  isLoading: boolean;
  error: GalleryServiceError | null;
  /** Re-runs the fetch (e.g. from an error state's "Try again" action). */
  refetch: () => void;
}

/**
 * Loads gallery images via gallery.service.ts and exposes
 * loading/error/data state plus a refetch trigger. Keeps all fetching
 * logic out of the Gallery page component itself — same shape as
 * useMenuItems().
 */
export function useGalleryItems(): UseGalleryItemsResult {
  const [items, setItems] = useState<GalleryImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<GalleryServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    getGalleryItems().then((result) => {
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
