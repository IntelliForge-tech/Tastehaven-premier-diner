import { useEffect, useRef, useState } from "react";

import {
  deleteHeroImage,
  updateHero,
  uploadHeroImage,
  type HeroServiceError,
  type UpdateHeroInput,
} from "@/services/hero.service";

export interface UpdateHeroFormValues {
  headline: string;
  headlineHighlight: string;
  headlineSuffix: string;
  badgeText: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  overlayOpacity: number;
  isVisible: boolean;
  /**
   * null  → keep the existing background image (no file was picked).
   * File  → replace with this new file.
   */
  imageFile: File | null;
  /**
   * true  → the admin explicitly cleared the image (Remove button).
   * Combined with imageFile === null this means "set to null in DB".
   */
  imageCleared: boolean;
}

export type UpdateHeroOutcome =
  | { success: true }
  | { success: false; error: HeroServiceError };

export interface UseUpdateHeroResult {
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
    values: UpdateHeroFormValues,
    existingImageUrl: string | null,
  ) => Promise<UpdateHeroOutcome>;
}

/**
 * Orchestrates the hero update flow, mirroring useUpdateChef() exactly:
 * upload-then-save, rollback on partial failure, clean up old file on
 * success. The hero record is a singleton so there is no id parameter.
 */
export function useUpdateHero(): UseUpdateHeroResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function updateItem(
    values: UpdateHeroFormValues,
    existingImageUrl: string | null,
  ): Promise<UpdateHeroOutcome> {
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = existingImageUrl;
      let newlyUploadedUrl: string | null = null;

      if (values.imageFile) {
        // A new file was picked — upload it first.
        const uploadResult = await uploadHeroImage(values.imageFile);
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }
        imageUrl = uploadResult.data.publicUrl;
        newlyUploadedUrl = imageUrl;
      } else if (values.imageCleared) {
        // Admin removed the image without picking a replacement.
        imageUrl = null;
      }

      const input: UpdateHeroInput = {
        headline: values.headline,
        headlineHighlight: values.headlineHighlight.trim() || null,
        headlineSuffix: values.headlineSuffix.trim() || null,
        badgeText: values.badgeText.trim() || null,
        description: values.description.trim() || null,
        primaryButtonText: values.primaryButtonText.trim() || null,
        primaryButtonLink: values.primaryButtonLink.trim() || null,
        secondaryButtonText: values.secondaryButtonText.trim() || null,
        secondaryButtonLink: values.secondaryButtonLink.trim() || null,
        backgroundImageUrl: imageUrl,
        overlayOpacity: values.overlayOpacity,
        isVisible: values.isVisible,
      };

      const updateResult = await updateHero(input);

      if (!updateResult.success) {
        // Rollback: if we just uploaded a new file but the record save failed,
        // delete the orphaned upload so Storage stays clean.
        if (newlyUploadedUrl) {
          void deleteHeroImage(newlyUploadedUrl);
        }
        return { success: false, error: updateResult.error };
      }

      // Record saved successfully. Clean up the old image if it was replaced.
      if (newlyUploadedUrl && existingImageUrl && existingImageUrl !== imageUrl) {
        void deleteHeroImage(existingImageUrl);
      }

      // Also clean up old image when admin cleared it (imageCleared=true, imageFile=null).
      if (values.imageCleared && !values.imageFile && existingImageUrl) {
        void deleteHeroImage(existingImageUrl);
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
