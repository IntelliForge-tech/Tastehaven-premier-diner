import { useEffect, useRef, useState } from "react";

import {
  deleteAboutImage,
  updateAbout,
  uploadAboutImage,
  type AboutFeature,
  type AboutServiceError,
  type UpdateAboutInput,
} from "@/services/about.service";

export interface UpdateAboutFormValues {
  sectionTitle: string;
  headline: string;
  description: string;
  badgeLabel: string;
  badgeYear: string;
  badgeSubtext: string;
  features: AboutFeature[];
  isVisible: boolean;
  /**
   * null  → keep the existing image (no file was picked).
   * File  → replace with this new file.
   */
  imageFile: File | null;
  /**
   * true  → the admin explicitly cleared the image (Remove button).
   * Combined with imageFile === null this means "set to null in DB".
   */
  imageCleared: boolean;
}

export type UpdateAboutOutcome =
  | { success: true }
  | { success: false; error: AboutServiceError };

export interface UseUpdateAboutResult {
  isSubmitting: boolean;
  /**
   * Orchestrates the save flow:
   * 1. Upload new image if one was picked.
   * 2. Save the record with the resolved image URL.
   * 3. On success: clean up old image if it was replaced.
   * 4. On failure after upload: roll back by deleting the new upload.
   *
   * `existingImageUrl` is the current stored URL — needed so we can
   * delete it after a successful replacement, without an extra fetch.
   */
  updateItem: (
    values: UpdateAboutFormValues,
    existingImageUrl: string | null,
  ) => Promise<UpdateAboutOutcome>;
}

/**
 * Orchestrates the about update flow, mirroring useUpdateHero() exactly:
 * upload-then-save, rollback on partial failure, clean up old file on
 * success. The about record is a singleton so there is no id parameter.
 */
export function useUpdateAbout(): UseUpdateAboutResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateItem(
    values: UpdateAboutFormValues,
    existingImageUrl: string | null,
  ): Promise<UpdateAboutOutcome> {
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = existingImageUrl;
      let newlyUploadedUrl: string | null = null;

      if (values.imageFile) {
        // A new file was picked — upload it first.
        const uploadResult = await uploadAboutImage(values.imageFile);
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }
        imageUrl = uploadResult.data.publicUrl;
        newlyUploadedUrl = imageUrl;
      } else if (values.imageCleared) {
        // Admin removed the image without picking a replacement.
        imageUrl = null;
      }

      const input: UpdateAboutInput = {
        sectionTitle: values.sectionTitle,
        headline: values.headline,
        description: values.description.trim() || null,
        badgeLabel: values.badgeLabel.trim() || null,
        badgeYear: values.badgeYear.trim() || null,
        badgeSubtext: values.badgeSubtext.trim() || null,
        imageUrl,
        features: values.features,
        isVisible: values.isVisible,
      };

      const updateResult = await updateAbout(input);

      if (!updateResult.success) {
        // Rollback: if we just uploaded a new file but the record save failed,
        // delete the orphaned upload so Storage stays clean.
        if (newlyUploadedUrl) {
          void deleteAboutImage(newlyUploadedUrl);
        }
        return { success: false, error: updateResult.error };
      }

      // Record saved successfully. Clean up the old image if it was replaced.
      if (newlyUploadedUrl && existingImageUrl && existingImageUrl !== imageUrl) {
        void deleteAboutImage(existingImageUrl);
      }

      // Also clean up old image when admin cleared it.
      if (values.imageCleared && !values.imageFile && existingImageUrl) {
        void deleteAboutImage(existingImageUrl);
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
