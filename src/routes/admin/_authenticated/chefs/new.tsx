import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { ChefForm } from "@/components/admin/chefs/ChefForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/chefs/new")({
  component: AdminNewChefPage,
  head: () => ({
    meta: [{ title: "Add Chef — Admin — Taste Haven" }],
  }),
});

/**
 * Dedicated create route — sibling to /admin/chefs, not nested under
 * it. Owns only where Cancel and success navigate to; ChefForm owns the
 * form itself, useCreateChef() owns the data workflow.
 */
function AdminNewChefPage() {
  const navigate = useNavigate();

  function goToChefsList() {
    navigate({ to: "/admin/chefs" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Add Chef" />
      <PageHeader
        title="Add Chef"
        description="Create a new chef profile for your restaurant."
      />
      <SectionContainer>
        <ChefForm
          mode="create"
          onSuccess={goToChefsList}
          onCancel={goToChefsList}
        />
      </SectionContainer>
    </div>
  );
}
