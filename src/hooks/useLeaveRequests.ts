import { useCallback, useEffect, useState } from "react";
import { getLeaveRequests, type LeaveRequest } from "@/services/staff/staff-leave.service";

export function useLeaveRequests(staffMemberId?: string) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); setError(null);
    getLeaveRequests(staffMemberId).then((r) => {
      if (cancelled) return;
      if (r.success) setRequests(r.data); else { setError(r.error.message); setRequests([]); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [token, staffMemberId]);

  const refetch = useCallback(() => setToken((t) => t + 1), []);
  return { requests, isLoading, error, refetch };
}
