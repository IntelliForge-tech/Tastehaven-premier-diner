import { useCallback, useEffect, useState } from "react";
import { getDepartments, type StaffDepartment } from "@/services/staff/staff-departments.service";

export function useDepartments() {
  const [departments, setDepartments] = useState<StaffDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true); setError(null);
    getDepartments().then((r) => {
      if (cancelled) return;
      if (r.success) setDepartments(r.data); else { setError(r.error.message); setDepartments([]); }
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [token]);

  const refetch = useCallback(() => setToken((t) => t + 1), []);
  return { departments, isLoading, error, refetch };
}
