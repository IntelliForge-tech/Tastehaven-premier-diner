import { useCallback, useEffect, useState } from "react";

import {
  getContactInformation,
  type ContactInformation,
  type ContactInfoError,
} from "@/services/contact-information.service";

export interface UseContactInformationResult {
  contactInfo: ContactInformation | null;
  isLoading: boolean;
  error: ContactInfoError | null;
  refetch: () => void;
}

export function useContactInformation(): UseContactInformationResult {
  const [contactInfo, setContactInfo] = useState<ContactInformation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ContactInfoError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getContactInformation().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setContactInfo(result.data);
      } else {
        setError(result.error);
        setContactInfo(null);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { contactInfo, isLoading, error, refetch };
}
