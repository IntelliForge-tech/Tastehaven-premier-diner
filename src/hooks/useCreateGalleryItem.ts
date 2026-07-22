import { useEffect, useRef, useState } from "react";

import {
  createGalleryItem,
  deleteGalleryImage,
  uploadGalleryImage,
  type CreateGalleryItemInput,
  type GalleryServiceError,
} from "@/services/gallery.service";

export interface CreateGalleryItemFormValues {
  caption: string;
  altText: string;
  isFeatured: boolean;
  imageFile: File | null;
}

export type CreateGalleryItemOutcome =
  { success: true } | { success: false; error: GalleryServiceError };

export interface UseCreateGalleryItemResult {
  isSubmitting: boolean;
  /** Uploads the image then creates the item. Never throws. */
  createItem: (values: CreateGalleryItemFormValues) => Promise<CreateGalleryItemOutcome>;
}

/**
 * Orchestrates the two-step create flow (image upload, then insert)
 * behind one call, and tracks the single loading state that covers both
 * steps — same shape as useCreateMenuItem().
 *
 * One difference from useCreateMenuItem(): if the upload succeeds but
 * the subsequent createGalleryItem() insert fails, this cleans up the
 * now-orphaned Storage file via deleteGalleryImage() before returning
 * the error, rather than leaving it behind. (useCreateMenuItem() doesn't
 * currently do this for menu images — not something this phase touches,
 * since Menu's create flow is already-shipped, working code, but worth
 * knowing the two aren't identical here.)
 */
export function useCreateGalleryItem(): UseCreateGalleryItemResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function createItem(
    values: CreateGalleryItemFormValues,
  ): Promise<CreateGalleryItemOutcome> {
    setIsSubmitting(true);

    try {
      // Validation guarantees imageFile is non-null by the time this
      // runs (see gallery-item-schema.ts's first imageFile refine) — the
      // type stays `File | null` end to end, so this check exists to
      // satisfy that, not because it's expected to ever be true here.
      if (!values.imageFile) {
        return {
          success: false,
          error: { code: "upload_error", message: "Please choose an image to upload." },
        };
      }

      const uploadResult = await uploadGalleryImage(values.imageFile);

      if (!uploadResult.success) {
        return { success: false, error: uploadResult.error };
      }

      const imageUrl = uploadResult.data.publicUrl;

      const input: CreateGalleryItemInput = {
        caption: values.caption.trim() === "" ? null : values.caption,
        altText: values.altText,
        isFeatured: values.isFeatured,
        imageUrl,
      };

      const createResult = await createGalleryItem(input);

      if (!createResult.success) {
        // The image is already in Storage but the record never landed —
        // clean it up rather than leave an orphaned file. Best-effort:
        // deleteGalleryImage() swallows its own errors, so this can't
        // itself fail or mask the real error being returned below.
        void deleteGalleryImage(imageUrl);
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
