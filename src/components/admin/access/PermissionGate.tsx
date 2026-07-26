import { usePermissions } from "@/context/PermissionContext";

interface PermissionGateProps {
  /** Permission slug e.g. "reservations.edit" */
  permission: string;
  /** If true, show nothing instead of null when access denied */
  children: React.ReactNode;
  /** Optional fallback rendered when access is denied (default: null) */
  fallback?: React.ReactNode;
}

/**
 * Renders children only when the current user has the required permission.
 *
 * Usage:
 *   <PermissionGate permission="reservations.edit">
 *     <EditButton />
 *   </PermissionGate>
 *
 * With fallback:
 *   <PermissionGate permission="staff.view" fallback={<AccessDeniedCard />}>
 *     <StaffTable />
 *   </PermissionGate>
 *
 * NOTE: This is a UX gate only. Backend RLS is the authoritative check.
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const { hasPermission, isLoading } = usePermissions();

  // While permissions are loading, render nothing to avoid flicker
  if (isLoading) return null;

  if (!hasPermission(permission)) return <>{fallback}</>;

  return <>{children}</>;
}

/** Gate for multiple permissions (any match) */
interface AnyPermissionGateProps {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AnyPermissionGate({ permissions, children, fallback = null }: AnyPermissionGateProps) {
  const { hasAnyPermission, isLoading } = usePermissions();
  if (isLoading) return null;
  if (!hasAnyPermission(permissions)) return <>{fallback}</>;
  return <>{children}</>;
}
