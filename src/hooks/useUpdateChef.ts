import { useEffect, useRef, useState } from "react";

import {
  deleteChefImage,
  updateChef,
  uploadChefImage,
  type ChefsServiceError,
  type UpdateChefInput,
} from "@/services/chefs.service";

export interface UpdateChefFormValues {
  name: string;
  position: string;
  bio: string;
  yearsExperience: number | null;
  displayOrder: number;
  isActive: boolean;
  /** null when no replacement file was picked — existing image is kept. */
  imageFile: File | null;
}

export type UpdateChefOutcome =
  | { success: true }
  | { success: false; error: ChefsServiceError };

export interface UseUpdateChefResult {
  isSubmitting: boolean;
  /**
   * Uploads a replacement image (if one was picked) then updates the
   * chef record. `existingImageUrl` is the current stored image URL —
   * needed so a successful replacement can clean up the old file
   * afterward without a second fetch.
   */
  updateItem: (
    id: string,
    values: UpdateChefFormValues,
    existingImageUrl: string | null,
  ) => Promise<UpdateChefOutcome>;
}

/**
 * Orchestrates the edit/replace flow, mirroring useUpdateGalleryItem()
 * exactly:
 *
 * 1. If a replacement file was picked, upload it.
 *    - If upload fails, stop here (don't save a stale image reference).
 * 2. Call updateChef() with the resolved image URL.
 *    - If update fails and we just uploaded a new file, delete that
 *      new file (rollback) so no orphaned file is left in Storage,
 *      and leave the original image intact on the record.
 * 3. If update succeeds and the image was replaced, clean up the old
 *    Storage file (best-effort, swallowed by deleteChefImage()).
 *
 * Image URL may be null (chef has no photo) — this case is handled
 * throughout without special-casing, matching the nullable imageUrl
 * in ChefDetail and UpdateChefInput.
 */
export function useUpdateChef(): UseUpdateChefResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateItem(
    id: string,
    values: UpdateChefFormValues,
    existingImageUrl: string | null,
  ): Promise<UpdateChefOutcome> {
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = existingImageUrl;
      let newlyUploadedUrl: string | null = null;

      if (values.imageFile) {
        const uploadResult = await uploadChefImage(values.imageFile);

        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }

        imageUrl = uploadResult.data.publicUrl;
        newlyUploadedUrl = imageUrl;
      }

      const input: UpdateChefInput = {
        name: values.name,
        position: values.position,
        bio: values.bio.trim() === "" ? null : values.bio,
        yearsExperience: values.yearsExperience,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
        imageUrl,
      };

      const updateResult = await updateChef(id, input);

      if (!updateResult.success) {
        // Rollback: the new file uploaded but the record save failed —
        // delete the newly uploaded file, leave the old one untouched.
        if (newlyUploadedUrl) {
          void deleteChefImage(newlyUploadedUrl);
        }
        return { success: false, error: updateResult.error };
      }

      // Only clean up the old file after the record is safely updated.
      if (newlyUploadedUrl && existingImageUrl && existingImageUrl !== imageUrl) {
        void deleteChefImage(existingImageUrl);
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
