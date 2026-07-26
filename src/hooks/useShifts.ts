import { useCallback, useEffect, useState } from "react";
import { getShifts, type StaffShift } from "@/services/staff/staff-shifts.service";

export function useShifts() {
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); setError(null);
    getShifts().then((r) => {
      if (cancelled) return;
      if (r.success) setShifts(r.data); else { setError(r.error.message); setShifts([]); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [token]);

  const refetch = useCallback(() => setToken((t) => t + 1), []);
  return { shifts, isLoading, error, refetch };
}
