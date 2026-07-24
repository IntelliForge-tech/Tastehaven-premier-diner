import { useEffect, useRef, useState } from "react";

import {
  updateFaq,
  type FaqServiceError,
  type UpdateFaqInput,
} from "@/services/faq.service";

export type UpdateFaqOutcome =
  | { success: true }
  | { success: false; error: FaqServiceError };

export interface UseUpdateFaqResult {
  isSubmitting: boolean;
  submit: (input: UpdateFaqInput) => Promise<UpdateFaqOutcome>;
}

export function useUpdateFaq(): UseUpdateFaqResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function submit(input: UpdateFaqInput): Promise<UpdateFaqOutcome> {
    setIsSubmitting(true);
    try {
      const result = await updateFaq(input);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return { isSubmitting, submit };
}
