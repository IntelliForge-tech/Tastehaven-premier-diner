import { createFileRoute } from "@tanstack/react-router";
import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";

import { RoleAnalyticsCards } from "@/components/admin/access/RoleAnalyticsCards";
import { RoleEditor } from "@/components/admin/access/RoleTable";
import { RoleTable } from "@/components/admin/access/RoleTable";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useRoles, useStaffWithRoles } from "@/hooks/useRbac";
import type { Role } from "@/services/roles.service";

export const Route = createFileRoute("/admin/_authenticated/access/")({
  component: AdminAccessPage,
  head: () => ({ meta: [{ title: "Access Control — Admin — Taste Haven" }] }),
});

function AdminAccessPage() {
  const { roles, isLoading, refetch } = useRoles();
  const { staff } = useStaffWithRoles();
  const [editingRole, setEditingRole] = useState<Role | null | "new">(null);

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Access Control" />
      <PageHeader
        title="Access Control"
        description="Manage roles, permissions, and staff access."
        action={
          <div className="flex gap-2">
            <Button type="button" variant="outline-gold" onClick={refetch} className="h-8 px-3 text-xs gap-2">
              <RefreshCw className="size-3.5" /> Refresh
            </Button>
            <Button type="button" variant="gold" onClick={() => setEditingRole("new")} className="h-8 px-3 text-xs gap-2">
              <Plus className="size-3.5" /> New Role
            </Button>
          </div>
        }
      />

      {/* Analytics */}
      {!isLoading && <RoleAnalyticsCards roles={roles} staff={staff} />}

      {/* Create / Edit form */}
      {editingRole !== null && (
        <SectionContainer>
          <h3 className="mb-4 text-sm font-semibold">
            {editingRole === "new" ? "Create New Role" : `Edit: ${(editingRole as Role).name}`}
          </h3>
          <RoleEditor
            role={editingRole === "new" ? null : (editingRole as Role)}
            onSuccess={() => { setEditingRole(null); refetch(); }}
            onCancel={() => setEditingRole(null)}
          />
        </SectionContainer>
      )}

      {/* Role table */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">All Roles</h3>
        {isLoading ? (
          <div className="h-40 animate-pulse rounded-xl border border-border bg-muted" />
        ) : (
          <RoleTable
            roles={roles}
            onEdit={(r) => setEditingRole(r)}
            onRefetch={refetch}
          />
        )}
      </div>
    </div>
  );
}
