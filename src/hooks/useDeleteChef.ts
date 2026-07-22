import { useEffect, useRef, useState } from "react";

import {
  deleteChef,
  deleteChefImage,
  type ChefsServiceError,
} from "@/services/chefs.service";

export type DeleteChefOutcome =
  | { success: true }
  | { success: false; error: ChefsServiceError };

export interface UseDeleteChefResult {
  isDeleting: boolean;
  /** Hard-deletes the record, then best-effort cleans up its image. Never throws. */
  deleteItem: (id: string, imageUrl: string | null) => Promise<DeleteChefOutcome>;
}

/**
 * Orchestrates the delete flow, mirroring useDeleteGalleryItem() exactly.
 * `imageUrl` may be null if the chef has no photo — deleteChefImage()
 * is simply not called in that case rather than passing null through.
 */
export function useDeleteChef(): UseDeleteChefResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function deleteItem(
    id: string,
    imageUrl: string | null,
  ): Promise<DeleteChefOutcome> {
    setIsDeleting(true);

    try {
      const result = await deleteChef(id);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Record is gone — now clean up Storage. Best-effort: a failure
      // here is logged inside deleteChefImage() but is not surfaced to
      // the caller as a delete failure.
      if (imageUrl) {
        void deleteChefImage(imageUrl);
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  }

  return { isDeleting, deleteItem };
}
