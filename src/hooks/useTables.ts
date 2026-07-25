import { useCallback, useEffect, useState } from "react";

import { getTables, type RestaurantTable, type TablesServiceError } from "@/services/tables.service";

export interface UseTablesResult {
  tables: RestaurantTable[];
  isLoading: boolean;
  error: TablesServiceError | null;
  refetch: () => void;
}

export function useTables(floorId?: string): UseTablesResult {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<TablesServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getTables(floorId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setTables(result.data);
      } else {
        setError(result.error);
        setTables([]);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken, floorId]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { tables, isLoading, error, refetch };
}
