import { useEffect, useRef, useState } from "react";

import {
  deleteGalleryImage,
  deleteGalleryItem,
  type GalleryServiceError,
} from "@/services/gallery.service";

export type DeleteGalleryItemOutcome =
  { success: true } | { success: false; error: GalleryServiceError };

export interface UseDeleteGalleryItemResult {
  isDeleting: boolean;
  /** Soft-deletes the record, then best-effort cleans up its image. Never throws. */
  deleteItem: (id: string, imageUrl: string) => Promise<DeleteGalleryItemOutcome>;
}

/**
 * Orchestrates the delete flow behind one call, mirroring
 * useDeleteMenuItem() exactly — the Gallery listing page calls this
 * instead of touching gallery.service.ts directly.
 */
export function useDeleteGalleryItem(): UseDeleteGalleryItemResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function deleteItem(id: string, imageUrl: string): Promise<DeleteGalleryItemOutcome> {
    setIsDeleting(true);

    try {
      const result = await deleteGalleryItem(id);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // The record is already gone at this point either way — a
      // storage cleanup failure here shouldn't be surfaced as the
      // delete failing.
      void deleteGalleryImage(imageUrl);

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  }

  return { isDeleting, deleteItem };
}
