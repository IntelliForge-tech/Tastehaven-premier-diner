import { useCallback, useEffect, useState } from "react";

import { getFaqs, type FaqItem, type FaqServiceError } from "@/services/faq.service";

export interface UseFaqsResult {
  items: FaqItem[];
  isLoading: boolean;
  error: FaqServiceError | null;
  refetch: () => void;
}

export function useFaqs(): UseFaqsResult {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FaqServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getFaqs().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setItems(result.data);
      } else {
        setError(result.error);
        setItems([]);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { items, isLoading, error, refetch };
}
