import { useCallback, useEffect, useState } from "react";

import {
  getMessages,
  type ContactMessage,
  type MessagesServiceError,
} from "@/services/messages.service";

export interface UseMessagesResult {
  items: ContactMessage[];
  isLoading: boolean;
  error: MessagesServiceError | null;
  refetch: () => void;
}

export function useMessages(): UseMessagesResult {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<MessagesServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getMessages().then((result) => {
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
