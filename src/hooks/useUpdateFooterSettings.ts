import { useEffect, useRef, useState } from "react";

import {
  updateFooterSettings,
  type FooterServiceError,
  type UpdateFooterSettingsInput,
} from "@/services/footer.service";

export type UpdateFooterSettingsOutcome =
  | { success: true }
  | { success: false; error: FooterServiceError };

export interface UseUpdateFooterSettingsResult {
  isSubmitting: boolean;
  updateItem: (input: UpdateFooterSettingsInput) => Promise<UpdateFooterSettingsOutcome>;
}

export function useUpdateFooterSettings(): UseUpdateFooterSettingsResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function updateItem(
    input: UpdateFooterSettingsInput,
  ): Promise<UpdateFooterSettingsOutcome> {
    setIsSubmitting(true);
    try {
      const result = await updateFooterSettings(input);
      if (!result.success) return { success: false, error: result.error };
      return { success: true };
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return { isSubmitting, updateItem };
}
