import { useCallback, useEffect, useState } from "react";
import { getPerformance, type PerformanceRecord } from "@/services/staff/staff-performance.service";

export function usePerformance(staffMemberId?: string) {
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); setError(null);
    getPerformance(staffMemberId).then((r) => {
      if (cancelled) return;
      if (r.success) setRecords(r.data); else { setError(r.error.message); setRecords([]); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [token, staffMemberId]);

  const refetch = useCallback(() => setToken((t) => t + 1), []);
  return { records, isLoading, error, refetch };
}
