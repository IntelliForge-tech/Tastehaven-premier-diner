import { useCallback, useEffect, useState } from "react";

import { getFloors, type Floor, type FloorsServiceError } from "@/services/floors.service";

export interface UseFloorsResult {
  floors: Floor[];
  isLoading: boolean;
  error: FloorsServiceError | null;
  refetch: () => void;
}

export function useFloors(): UseFloorsResult {
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FloorsServiceError | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getFloors().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setFloors(result.data);
      } else {
        setError(result.error);
        setFloors([]);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { floors, isLoading, error, refetch };
}
