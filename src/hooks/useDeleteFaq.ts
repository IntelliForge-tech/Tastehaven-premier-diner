import { useEffect, useRef, useState } from "react";

import { deleteFaq, type FaqServiceError } from "@/services/faq.service";

export type DeleteFaqOutcome =
  | { success: true }
  | { success: false; error: FaqServiceError };

export interface UseDeleteFaqResult {
  isDeleting: boolean;
  deleteItem: (id: string) => Promise<DeleteFaqOutcome>;
}

export function useDeleteFaq(): UseDeleteFaqResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function deleteItem(id: string): Promise<DeleteFaqOutcome> {
    setIsDeleting(true);
    try {
      const result = await deleteFaq(id);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setIsDeleting(false);
    }
  }

  return { isDeleting, deleteItem };
}
