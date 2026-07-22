import { useEffect, useRef, useState } from "react";

import {
  deleteMenuItemImage,
  updateMenuItem,
  uploadMenuItemImage,
  type MenuServiceError,
  type UpdateMenuItemInput,
} from "@/services/menu/menu.service";

export interface UpdateMenuItemFormValues {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  isFeatured: boolean;
  isAvailable: boolean;
  /** null when no new file was picked — in that case the existing image is kept as-is. */
  imageFile: File | null;
}

export type UpdateMenuItemOutcome =
  | { success: true }
  | { success: false; error: MenuServiceError };

export interface UseUpdateMenuItemResult {
  isSubmitting: boolean;
  /**
   * Uploads a replacement image (if one was picked) then updates the
   * item, mirroring useCreateMenuItem()'s two-step shape. `existingImageUrl`
   * is the item's current image before this save — needed so a
   * replacement can clean up the old file afterward without a second
   * fetch.
   */
  updateItem: (
    id: string,
    values: UpdateMenuItemFormValues,
    existingImageUrl: string | null,
  ) => Promise<UpdateMenuItemOutcome>;
}

/**
 * Orchestrates the edit flow. Mirrors useCreateMenuItem() closely on
 * purpose: MenuForm calls this instead of touching menu.service.ts (or
 * Supabase) directly, whether it's rendering in create or edit mode.
 */
export function useUpdateMenuItem(): UseUpdateMenuItemResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateItem(
    id: string,
    values: UpdateMenuItemFormValues,
    existingImageUrl: string | null,
  ): Promise<UpdateMenuItemOutcome> {
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = existingImageUrl;

      if (values.imageFile) {
        const uploadResult = await uploadMenuItemImage(values.imageFile);

        if (!uploadResult.success) {
          // Stop here, same as create — never proceed to save the record
          // with a stale image reference after a failed upload.
          return { success: false, error: uploadResult.error };
        }

        imageUrl = uploadResult.data.publicUrl;
      }

      const input: UpdateMenuItemInput = {
        name: values.name,
        description: values.description.trim() === "" ? null : values.description,
        categoryId: values.categoryId,
        price: values.price,
        isFeatured: values.isFeatured,
        isAvailable: values.isAvailable,
        imageUrl,
      };

      const updateResult = await updateMenuItem(id, input);

      if (!updateResult.success) {
        return { success: false, error: updateResult.error };
      }

      // Only clean up the previous file once the new one is safely saved
      // on the record — never delete it first, and never delete it if
      // the update above failed.
      if (values.imageFile && existingImageUrl && existingImageUrl !== imageUrl) {
        void deleteMenuItemImage(existingImageUrl);
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }

  return { isSubmitting, updateItem };
}
