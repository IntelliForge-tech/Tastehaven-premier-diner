import { useEffect, useRef, useState } from "react";

import {
  createFaq,
  type CreateFaqInput,
  type FaqServiceError,
} from "@/services/faq.service";

export type CreateFaqOutcome =
  | { success: true }
  | { success: false; error: FaqServiceError };

export interface UseCreateFaqResult {
  isSubmitting: boolean;
  submit: (input: CreateFaqInput) => Promise<CreateFaqOutcome>;
}

export function useCreateFaq(): UseCreateFaqResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function submit(input: CreateFaqInput): Promise<CreateFaqOutcome> {
    setIsSubmitting(true);
    try {
      const result = await createFaq(input);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return { isSubmitting, submit };
}
