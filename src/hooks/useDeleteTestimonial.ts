import { useEffect, useRef, useState } from "react";

import {
  deleteTestimonial,
  type TestimonialsServiceError,
} from "@/services/testimonials.service";

export type DeleteTestimonialOutcome =
  | { success: true }
  | { success: false; error: TestimonialsServiceError };

export interface UseDeleteTestimonialResult {
  isDeleting: boolean;
  /** Hard-deletes the testimonial (no soft-delete column on the table). Never throws. */
  deleteItem: (id: string) => Promise<DeleteTestimonialOutcome>;
}

/** Mirrors useDeleteMenuItem/useDeleteGalleryItem — no storage cleanup needed since testimonials have no image. */
export function useDeleteTestimonial(): UseDeleteTestimonialResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  async function deleteItem(id: string): Promise<DeleteTestimonialOutcome> {
    setIsDeleting(true);

    try {
      const result = await deleteTestimonial(id);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true };
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
      }
    }
  }

  return { isDeleting, deleteItem };
}
