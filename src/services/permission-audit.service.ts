import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AuditLogEntry {
  id: string;
  action: string;
  actorId: string | null;
  targetUserId: string | null;
  roleId: string | null;
  permissionId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export type GetAuditLogsResult =
  | { success: true; data: AuditLogEntry[]; total: number }
  | { success: false; error: { message: string } };

export async function getPermissionAuditLogs(
  page = 1,
  pageSize = 50,
): Promise<GetAuditLogsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from("permission_audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) return { success: false, error: { message: error.message } };

    return {
      success: true,
      total: count ?? 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: (data ?? []).map((r: any) => ({
        id: r.id, action: r.action, actorId: r.actor_id,
        targetUserId: r.target_user_id, roleId: r.role_id,
        permissionId: r.permission_id, metadata: r.metadata,
        ipAddress: r.ip_address, createdAt: r.created_at,
      })),
    };
  } catch { return { success: false, error: { message: "Couldn't load audit logs." } }; }
}

export async function writeAuditLog(entry: {
  action: string;
  actorId?: string | null;
  targetUserId?: string | null;
  roleId?: string | null;
  permissionId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("permission_audit_logs").insert({
      action: entry.action,
      actor_id: entry.actorId ?? null,
      target_user_id: entry.targetUserId ?? null,
      role_id: entry.roleId ?? null,
      permission_id: entry.permissionId ?? null,
      metadata: entry.metadata ?? null,
    });
  } catch {
    // Non-fatal — audit log write failure must never crash the main flow
    console.warn("[permission-audit] write failed");
  }
}

export const AUDIT_ACTIONS = {
  ROLE_CREATED: "role.created",
  ROLE_UPDATED: "role.updated",
  ROLE_DELETED: "role.deleted",
  ROLE_DUPLICATED: "role.duplicated",
  PERMISSION_GRANTED: "permission.granted",
  PERMISSION_REVOKED: "permission.revoked",
  PERMISSIONS_RESET: "permissions.reset",
  ROLE_ASSIGNED: "role.assigned",
  ROLE_REMOVED: "role.removed",
} as const;
