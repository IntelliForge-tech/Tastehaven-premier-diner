import { useCallback, useEffect, useState } from "react";
import { getStaff, getStaffMember, type StaffMember, type StaffError } from "@/services/staff/staff.service";

export function useStaff() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StaffError | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); setError(null);
    getStaff().then((r) => {
      if (cancelled) return;
      if (r.success) setStaff(r.data); else { setError(r.error); setStaff([]); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [token]);

  const refetch = useCallback(() => setToken((t) => t + 1), []);
  return { staff, isLoading, error, refetch };
}

export function useStaffMember(id: string | null) {
  const [member, setMember] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<StaffError | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    if (!id) { setMember(null); setIsLoading(false); return; }
    let cancelled = false;
    setIsLoading(true); setError(null);
    getStaffMember(id).then((r) => {
      if (cancelled) return;
      if (r.success) setMember(r.data); else { setError(r.error); setMember(null); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [id, token]);

  const refetch = useCallback(() => setToken((t) => t + 1), []);
  return { member, isLoading, error, refetch };
}
