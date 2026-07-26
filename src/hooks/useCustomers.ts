import { useCallback, useEffect, useState } from "react";

import {
  getCustomers,
  type CustomerListItem,
  type CustomerServiceError,
  type GetCustomersOptions,
} from "@/services/customers.service";

export interface UseCustomersResult {
  customers: CustomerListItem[];
  isLoading: boolean;
  error: CustomerServiceError | null;
  refetch: () => void;
}

export function useCustomers(options: GetCustomersOptions = {}): UseCustomersResult {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<CustomerServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  // Serialise options so the effect re-runs when filters change.
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getCustomers(options).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setCustomers(result.data);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { customers, isLoading, error, refetch };
}
