import { useEffect, useRef, useState } from "react";

import {
  deleteGalleryImage,
  updateGalleryItem,
  uploadGalleryImage,
  type GalleryServiceError,
  type UpdateGalleryItemInput,
} from "@/services/gallery.service";

export interface UpdateGalleryItemFormValues {
  caption: string;
  altText: string;
  isFeatured: boolean;
  /** null when no replacement file was picked — in that case the existing image is kept as-is. */
  imageFile: File | null;
}

export type UpdateGalleryItemOutcome =
  { success: true } | { success: false; error: GalleryServiceError };

export interface UseUpdateGalleryItemResult {
  isSubmitting: boolean;
  /**
   * Uploads a replacement image (if one was picked) then updates the
   * item, mirroring useUpdateMenuItem()'s two-step shape.
   * `existingImageUrl` is the item's current image before this save —
   * needed so a successful replacement can clean up the old file
   * afterward without a second fetch.
   */
  updateItem: (
    id: string,
    values: UpdateGalleryItemFormValues,
    existingImageUrl: string,
  ) => Promise<UpdateGalleryItemOutcome>;
}

/**
 * Orchestrates the edit/replace flow. Mirrors useUpdateMenuItem()
 * closely, with one deliberate addition this phase's spec explicitly
 * asked for: if a replacement image uploads successfully but the
 * subsequent updateGalleryItem() save then fails, the newly-uploaded
 * file is rolled back (deleted) here, and the old image is left in
 * place — "do not leave orphaned Storage files" applies to a failed
 * save just as much as a failed create. useUpdateMenuItem() doesn't
 * currently do this (it only cleans up the *old* image, and only after
 * a *successful* save) — that's already-shipped, working code this
 * phase doesn't touch, but flagging the inconsistency since you may
 * want it backported later, same as Phase 7B's create-cleanup note.
 */
export function useUpdateGalleryItem(): UseUpdateGalleryItemResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateItem(
    id: string,
    values: UpdateGalleryItemFormValues,
    existingImageUrl: string,
  ): Promise<UpdateGalleryItemOutcome> {
    setIsSubmitting(true);

    try {
      let imageUrl: string = existingImageUrl;
      let newlyUploadedUrl: string | null = null;

      if (values.imageFile) {
        const uploadResult = await uploadGalleryImage(values.imageFile);

        if (!uploadResult.success) {
          // Stop here, same as create — never proceed to save the
          // record with a stale image reference after a failed upload.
          return { success: false, error: uploadResult.error };
        }

        imageUrl = uploadResult.data.publicUrl;
        newlyUploadedUrl = imageUrl;
      }

      const input: UpdateGalleryItemInput = {
        caption: values.caption.trim() === "" ? null : values.caption,
        altText: values.altText,
        isFeatured: values.isFeatured,
        imageUrl,
      };

      const updateResult = await updateGalleryItem(id, input);

      if (!updateResult.success) {
        // The old image is untouched — only roll back the replacement
        // that was just uploaded, so this failed save doesn't leave an
        // orphaned file behind while also not losing the working image.
        if (newlyUploadedUrl) {
          void deleteGalleryImage(newlyUploadedUrl);
        }
        return { success: false, error: updateResult.error };
      }

      // Only clean up the previous file once the new one is safely
      // saved on the record — never delete it first, and never delete
      // it if the update above failed (handled above instead).
      if (newlyUploadedUrl && existingImageUrl !== imageUrl) {
        void deleteGalleryImage(existingImageUrl);
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
