import { createFileRoute } from "@tanstack/react-router";
import { Loader2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RoleBadge } from "@/components/admin/access/RoleBadge";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useRoles, useStaffWithRoles, useStaffRoleAssignment } from "@/hooks/useRbac";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/_authenticated/access/staff")({
  component: AdminStaffRolesPage,
  head: () => ({ meta: [{ title: "Staff Roles — Admin — Taste Haven" }] }),
});

function AdminStaffRolesPage() {
  const { staff, isLoading, refetch } = useStaffWithRoles();
  const { roles } = useRoles();
  const { assign, remove, isWorking } = useStaffRoleAssignment();
  const { user } = useAuth();
  const [assigning, setAssigning] = useState<string | null>(null); // staffId
  const [selectedRoleId, setSelectedRoleId] = useState("");

  async function handleAssign(staffId: string) {
    if (!selectedRoleId) return;
    const result = await assign({
      adminUserId: staffId,
      roleId: selectedRoleId,
      isPrimary: false,
      assignedBy: user?.id ?? "",
    });
    if (!result.success) toast.error(result.error.message);
    else { toast.success("Role assigned."); setAssigning(null); setSelectedRoleId(""); refetch(); }
  }

  async function handleRemove(staffId: string, roleId: string) {
    const result = await remove(staffId, roleId);
    if (!result.success) toast.error(result.error.message);
    else { toast.success("Role removed."); refetch(); }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Staff Roles" />
      <PageHeader title="Staff Roles" description="Assign or remove roles from staff members." />
      <SectionContainer>
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-xl bg-muted" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Staff Member</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Assigned Roles</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((s) => (
                  <tr key={s.id} className="group hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.fullName ?? s.email}</div>
                      <div className="text-xs text-muted-foreground">{s.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {s.roles.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No roles assigned</span>
                        ) : (
                          s.roles.map((r) => (
                            <div key={r.id} className="flex items-center gap-0.5">
                              <RoleBadge name={r.name} color={r.color} size="sm" />
                              <button
                                type="button"
                                onClick={() => handleRemove(s.id, r.id)}
                                disabled={isWorking}
                                className="grid size-4 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Remove ${r.name}`}
                              >
                                <X className="size-2.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {assigning === s.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={selectedRoleId}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                            className="h-7 rounded-md border border-border bg-background px-2 text-xs"
                          >
                            <option value="">Select role…</option>
                            {roles
                              .filter((r) => !s.roles.some((sr) => sr.id === r.id))
                              .map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                              ))}
                          </select>
                          <Button type="button" variant="gold" disabled={isWorking || !selectedRoleId} onClick={() => handleAssign(s.id)} className="h-7 px-2 text-xs">
                            {isWorking ? <Loader2 className="size-3 animate-spin" /> : "Assign"}
                          </Button>
                          <Button type="button" variant="outline-gold" onClick={() => setAssigning(null)} className="h-7 px-2 text-xs">Cancel</Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setAssigning(s.id); setSelectedRoleId(""); }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <UserPlus className="size-3.5" /> Assign Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionContainer>
    </div>
  );
}
