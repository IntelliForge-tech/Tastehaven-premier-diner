import { createFileRoute } from "@tanstack/react-router";

import { PermissionMatrix } from "@/components/admin/access/PermissionMatrix";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/access/matrix")({
  component: AdminPermissionMatrixPage,
  head: () => ({ meta: [{ title: "Permission Matrix — Admin — Taste Haven" }] }),
});

function AdminPermissionMatrixPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs page="Permission Matrix" />
      <PageHeader
        title="Permission Matrix"
        description="Select a role and toggle permissions per module. Changes are saved immediately."
      />
      <SectionContainer>
        <PermissionMatrix />
      </SectionContainer>
    </div>
  );
}
