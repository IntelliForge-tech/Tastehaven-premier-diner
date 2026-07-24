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
  heading: string;
  description: string;
  features: AboutFeature[];
  badgeYear: string;
  badgeText: string;
  isVisible: boolean;
  /** null → keep existing image. File → replace with this file. */
  imageFile: File | null;
  /** true → admin explicitly removed the image via the Remove button. */
  imageCleared: boolean;
}

export type UpdateAboutOutcome =
  | { success: true }
  | { success: false; error: AboutServiceError };

export interface UseUpdateAboutResult {
  isSubmitting: boolean;
  updateItem: (
    values: UpdateAboutFormValues,
    existingImageUrl: string | null,
  ) => Promise<UpdateAboutOutcome>;
}

/**
 * Orchestrates the About section update flow.
 * Mirrors useUpdateHero() exactly:
 *  1. Upload new image if picked.
 *  2. Save record with resolved image URL.
 *  3. On failure after upload: rollback by deleting the orphaned file.
 *  4. On success: clean up old image if it was replaced or cleared.
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
        const uploadResult = await uploadAboutImage(values.imageFile);
        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }
        imageUrl = uploadResult.data.publicUrl;
        newlyUploadedUrl = imageUrl;
      } else if (values.imageCleared) {
        imageUrl = null;
      }

      const input: UpdateAboutInput = {
        sectionTitle: values.sectionTitle.trim() || "Our Story",
        heading: values.heading,
        description: values.description.trim() || null,
        features: values.features,
        imageUrl,
        badgeYear: values.badgeYear.trim() || null,
        badgeText: values.badgeText.trim() || null,
        isVisible: values.isVisible,
      };

      const updateResult = await updateAbout(input);

      if (!updateResult.success) {
        if (newlyUploadedUrl) {
          void deleteAboutImage(newlyUploadedUrl);
        }
        return { success: false, error: updateResult.error };
      }

      // Clean up old image when replaced.
      if (newlyUploadedUrl && existingImageUrl && existingImageUrl !== imageUrl) {
        void deleteAboutImage(existingImageUrl);
      }

      // Clean up old image when cleared.
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
