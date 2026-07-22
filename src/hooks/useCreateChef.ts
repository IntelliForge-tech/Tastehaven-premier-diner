import { useEffect, useRef, useState } from "react";

import {
  createChef,
  deleteChefImage,
  uploadChefImage,
  type CreateChefInput,
  type ChefsServiceError,
} from "@/services/chefs.service";

export interface CreateChefFormValues {
  name: string;
  position: string;
  bio: string;
  yearsExperience: number | null;
  displayOrder: number;
  isActive: boolean;
  imageFile: File | null;
}

export type CreateChefOutcome =
  | { success: true }
  | { success: false; error: ChefsServiceError };

export interface UseCreateChefResult {
  isSubmitting: boolean;
  /** Uploads the image (if provided) then inserts the row. Never throws. */
  createItem: (values: CreateChefFormValues) => Promise<CreateChefOutcome>;
}

/**
 * Orchestrates the create flow: optional image upload, then DB insert.
 * If the upload succeeds but the insert fails, the uploaded image is
 * cleaned up (best-effort) before returning the error — same rollback
 * pattern as useCreateGalleryItem(), since the schema's image_url is
 * nullable, so we don't want orphaned files even when image upload was
 * chosen by the user.
 */
export function useCreateChef(): UseCreateChefResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function createItem(values: CreateChefFormValues): Promise<CreateChefOutcome> {
    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (values.imageFile) {
        const uploadResult = await uploadChefImage(values.imageFile);

        if (!uploadResult.success) {
          return { success: false, error: uploadResult.error };
        }

        imageUrl = uploadResult.data.publicUrl;
      }

      const input: CreateChefInput = {
        name: values.name,
        position: values.position,
        bio: values.bio.trim() === "" ? null : values.bio,
        yearsExperience: values.yearsExperience,
        displayOrder: values.displayOrder,
        isActive: values.isActive,
        imageUrl,
      };

      const createResult = await createChef(input);

      if (!createResult.success) {
        // Upload succeeded but insert failed — clean up the orphaned
        // Storage file. Best-effort: deleteChefImage() swallows its
        // own errors, so this can't mask the real error below.
        if (imageUrl) {
          void deleteChefImage(imageUrl);
        }
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
