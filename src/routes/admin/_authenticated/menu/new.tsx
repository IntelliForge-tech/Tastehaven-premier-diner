import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { MenuForm } from "@/components/admin/menu/MenuForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/menu/new")({
  component: AdminNewMenuItemPage,
  head: () => ({
    meta: [{ title: "Add Menu Item — Admin — Taste Haven" }],
  }),
});

/**
 * Dedicated create route (Phase 6B), sibling to /admin/menu rather than
 * nested under it — this page owns only navigation (where "back"/"after
 * success" go); MenuForm owns the form itself, and the hooks it calls
 * own everything Supabase-related.
 */
function AdminNewMenuItemPage() {
  const navigate = useNavigate();

  function goToMenuList() {
    navigate({ to: "/admin/menu" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Add Menu Item" />
      <PageHeader title="Add Menu Item" description="Create a new item for your restaurant menu." />
      <SectionContainer>
        <MenuForm onSuccess={goToMenuList} onCancel={goToMenuList} />
      </SectionContainer>
    </div>
  );
}
