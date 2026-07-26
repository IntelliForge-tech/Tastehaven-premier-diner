import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getMyPermissions } from "@/services/permissions.service";
import { useAuth } from "@/hooks/useAuth";

interface PermissionContextValue {
  permissions: Set<string>;
  isLoading: boolean;
  hasPermission: (slug: string) => boolean;
  /** True if user has ANY of the given slugs */
  hasAnyPermission: (slugs: string[]) => boolean;
  refetch: () => void;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setPermissions(new Set());
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    getMyPermissions(user.id).then((slugs) => {
      if (cancelled) return;
      setPermissions(slugs);
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [user?.id, isAuthenticated, reloadToken]);

  const hasPermission = useCallback(
    (slug: string) => {
      // Owner slug gets full access fallback even without staff_role assignment
      if (permissions.has("access.manage")) return true;
      return permissions.has(slug);
    },
    [permissions],
  );

  const hasAnyPermission = useCallback(
    (slugs: string[]) => slugs.some((s) => hasPermission(s)),
    [hasPermission],
  );

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return (
    <PermissionContext.Provider value={{ permissions, isLoading, hasPermission, hasAnyPermission, refetch }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextValue {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermissions must be used within <PermissionProvider>");
  return ctx;
}
