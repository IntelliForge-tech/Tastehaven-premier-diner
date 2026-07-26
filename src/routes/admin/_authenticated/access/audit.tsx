import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { usePermissionAudit } from "@/hooks/useRbac";
import { AUDIT_ACTIONS } from "@/services/permission-audit.service";

export const Route = createFileRoute("/admin/_authenticated/access/audit")({
  component: AdminPermissionAuditPage,
  head: () => ({ meta: [{ title: "Permission Audit — Admin — Taste Haven" }] }),
});

const ACTION_LABELS: Record<string, string> = {
  [AUDIT_ACTIONS.ROLE_CREATED]: "Role Created",
  [AUDIT_ACTIONS.ROLE_UPDATED]: "Role Updated",
  [AUDIT_ACTIONS.ROLE_DELETED]: "Role Deleted",
  [AUDIT_ACTIONS.ROLE_DUPLICATED]: "Role Duplicated",
  [AUDIT_ACTIONS.PERMISSION_GRANTED]: "Permission Granted",
  [AUDIT_ACTIONS.PERMISSION_REVOKED]: "Permission Revoked",
  [AUDIT_ACTIONS.PERMISSIONS_RESET]: "Permissions Reset",
  [AUDIT_ACTIONS.ROLE_ASSIGNED]: "Role Assigned",
  [AUDIT_ACTIONS.ROLE_REMOVED]: "Role Removed",
};

function AdminPermissionAuditPage() {
  const [page, setPage] = useState(1);
  const { logs, total, isLoading } = usePermissionAudit(page);
  const pageSize = 50;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Audit Log" />
      <PageHeader
        title="Permission Audit Log"
        description={`Tracks all role and permission changes. ${total} total entries.`}
      />
      <SectionContainer>
        {isLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No audit events recorded yet.</p>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Action</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground md:table-cell">Actor</th>
                    <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground lg:table-cell">Target</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                        {log.actorId ?? "—"}
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                        {log.targetUserId ?? log.roleId ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString("en-US", {
                          month: "short", day: "numeric",
                          hour: "numeric", minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > pageSize && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button type="button" variant="outline-gold" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-7 px-3 text-xs">← Prev</Button>
                <span className="text-xs text-muted-foreground">Page {page} of {Math.ceil(total / pageSize)}</span>
                <Button type="button" variant="outline-gold" disabled={page >= Math.ceil(total / pageSize)} onClick={() => setPage((p) => p + 1)} className="h-7 px-3 text-xs">Next →</Button>
              </div>
            )}
          </>
        )}
      </SectionContainer>
    </div>
  );
}
