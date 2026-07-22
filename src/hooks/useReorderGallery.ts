import { useEffect, useState } from "react";
import { toast } from "sonner";

import { updateGalleryOrder } from "@/services/gallery.service";
import type { GalleryImageItem } from "@/services/gallery.service";

export interface UseReorderGalleryResult {
  /** The current (possibly optimistically-reordered) list — render this, not the raw fetched list. */
  items: GalleryImageItem[];
  isReordering: boolean;
  /** Call with the full list in its new order (e.g. via @dnd-kit's arrayMove). Renumbers display_order sequentially from 0. */
  reorder: (newOrder: GalleryImageItem[]) => Promise<void>;
}

/**
 * Owns the gallery grid's displayed order and everything about
 * persisting a drag-and-drop reorder: applies the new order to the UI
 * immediately (optimistic), calls updateGalleryOrder(), and rolls back
 * to the pre-drag order if that save fails — the UI never has to know
 * the difference between "saved" and "still saving."
 *
 * Takes the freshly-fetched list from useGalleryItems() as input and
 * re-syncs to it whenever that list changes (initial load, or a refetch
 * after a delete) — so a delete's refetch() correctly becomes the new
 * baseline rather than being overwritten by a stale local order.
 */
export function useReorderGallery(sourceItems: GalleryImageItem[]): UseReorderGalleryResult {
  const [items, setItems] = useState<GalleryImageItem[]>(sourceItems);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    setItems(sourceItems);
  }, [sourceItems]);

  async function reorder(newOrder: GalleryImageItem[]): Promise<void> {
    const previousItems = items;

    // Sequential, gap-free display_order values (0, 1, 2, ...) reflecting
    // the dropped position — matches this phase's spec exactly.
    const renumbered = newOrder.map((item, index) => ({ ...item, displayOrder: index }));

    setItems(renumbered); // optimistic — UI updates before the save resolves
    setIsReordering(true);

    try {
      const result = await updateGalleryOrder(
        renumbered.map((item) => ({ id: item.id, displayOrder: item.displayOrder })),
      );

      if (!result.success) {
        setItems(previousItems); // rollback
        toast.error(result.error.message);
        return;
      }

      toast.success("Gallery order updated.");
    } finally {
      setIsReordering(false);
    }
  }

  return { items, isReordering, reorder };
}
