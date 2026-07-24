import { useEffect, useRef, useState } from "react";

import {
  updateSocialLinks,
  type SocialLinksError,
  type UpdateSocialLinksInput,
} from "@/services/social-links.service";

export type UpdateSocialLinksOutcome =
  | { success: true }
  | { success: false; error: SocialLinksError };

export interface UseUpdateContactSocialLinksResult {
  isSubmitting: boolean;
  submit: (input: UpdateSocialLinksInput) => Promise<UpdateSocialLinksOutcome>;
}

export function useUpdateContactSocialLinks(): UseUpdateContactSocialLinksResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function submit(input: UpdateSocialLinksInput): Promise<UpdateSocialLinksOutcome> {
    setIsSubmitting(true);
    try {
      const result = await updateSocialLinks(input);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return { isSubmitting, submit };
}
