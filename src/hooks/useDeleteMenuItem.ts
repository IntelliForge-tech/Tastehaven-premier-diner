import { useEffect, useRef, useState } from "react";

import {
  deleteMenuItem,
  deleteMenuItemImage,
  type MenuServiceError,
} from "@/services/menu/menu.service";

export type DeleteMenuItemOutcome =
  | { success: true }
  | { success: false; error: MenuServiceError };

export interface UseDeleteMenuItemResult {
  isDeleting: boolean;
  /** Deletes the record, then best-effort cleans up its image. Never throws. */
  deleteItem: (id: string, imageUrl: string | null) => Promise<DeleteMenuItemOutcome>;
}

/**
 * Orchestrates the delete flow behind one call, same pattern as
 * useCreateMenuItem()/useUpdateMenuItem() — the Menu listing page calls
 * this instead of touching menu.service.ts directly.
 */
export function useDeleteMenuItem(): UseDeleteMenuItemResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function deleteItem(id: string, imageUrl: string | null): Promise<DeleteMenuItemOutcome> {
    setIsDeleting(true);

    try {
      const result = await deleteMenuItem(id);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      // The record is already gone at this point either way — a storage
      // cleanup failure here shouldn't be surfaced as the delete failing.
      if (imageUrl) {
        void deleteMenuItemImage(imageUrl);
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
