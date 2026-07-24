import { useEffect, useRef, useState } from "react";

import {
  updateContactInformation,
  type ContactInfoError,
  type UpdateContactInformationInput,
} from "@/services/contact-information.service";

export type UpdateContactInformationOutcome =
  | { success: true }
  | { success: false; error: ContactInfoError };

export interface UseUpdateContactInformationResult {
  isSubmitting: boolean;
  submit: (input: UpdateContactInformationInput) => Promise<UpdateContactInformationOutcome>;
}

export function useUpdateContactInformation(): UseUpdateContactInformationResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function submit(
    input: UpdateContactInformationInput,
  ): Promise<UpdateContactInformationOutcome> {
    setIsSubmitting(true);
    try {
      const result = await updateContactInformation(input);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return { isSubmitting, submit };
}
