import { useCallback, useEffect, useState } from "react";
import { getAttendance, type AttendanceRecord } from "@/services/staff/staff-attendance.service";

export function useAttendance(staffMemberId?: string, dateFrom?: string, dateTo?: string) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); setError(null);
    getAttendance(staffMemberId, dateFrom, dateTo).then((r) => {
      if (cancelled) return;
      if (r.success) setAttendance(r.data); else { setError(r.error.message); setAttendance([]); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [token, staffMemberId, dateFrom, dateTo]);

  const refetch = useCallback(() => setToken((t) => t + 1), []);
  return { attendance, isLoading, error, refetch };
}
