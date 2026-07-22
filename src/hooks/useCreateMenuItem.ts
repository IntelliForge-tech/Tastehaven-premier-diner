import { useEffect, useRef, useState } from "react";

import {
  createMenuItem,
  uploadMenuItemImage,
  type CreateMenuItemInput,
  type MenuServiceError,
} from "@/services/menu/menu.service";

export interface CreateMenuItemFormValues {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  isFeatured: boolean;
  isAvailable: boolean;
  /** null when the admin didn't select a file. */
  imageFile: File | null;
}

export type CreateMenuItemOutcome =
  | { success: true }
  | { success: false; error: MenuServiceError };

export interface UseCreateMenuItemResult {
  isSubmitting: boolean;
  /** Uploads the image (if any) then creates the item. Never throws. */
  createItem: (values: CreateMenuItemFormValues) => Promise<CreateMenuItemOutcome>;
}

/**
 * Orchestrates the two-step create flow (optional image upload, then
 * insert) behind one call, and tracks the single loading state that
 * covers both steps. MenuForm calls this instead of touching
 * menu.service.ts (or Supabase) directly.
 */
export function useCreateMenuItem(): UseCreateMenuItemResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function createItem(values: CreateMenuItemFormValues): Promise<CreateMenuItemOutcome> {
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (values.imageFile) {
        const uploadResult = await uploadMenuItemImage(values.imageFile);

        if (!uploadResult.success) {
          // Stop here — an image upload failure should never silently
          // proceed to create the item without the image.
          return { success: false, error: uploadResult.error };
        }

        imageUrl = uploadResult.data.publicUrl;
      }

      const input: CreateMenuItemInput = {
        name: values.name,
        description: values.description.trim() === "" ? null : values.description,
        categoryId: values.categoryId,
        price: values.price,
        isFeatured: values.isFeatured,
        isAvailable: values.isAvailable,
        imageUrl,
      };

      const createResult = await createMenuItem(input);

      if (!createResult.success) {
        return { success: false, error: createResult.error };
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsSubmitting(false);
      }
    }
  }

  return { isSubmitting, createItem };
}
