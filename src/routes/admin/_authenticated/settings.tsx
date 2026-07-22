import { createFileRoute } from "@tanstack/react-router";
import { Save, Settings as SettingsIcon } from "lucide-react";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/settings")({
  component: AdminSettingsPage,
  head: () => ({
    meta: [{ title: "Restaurant Settings — Admin — Taste Haven" }],
  }),
});

/**
 * Placeholder page — structure only. No CRUD, Supabase, or API calls
 * yet. Settings is a singleton (one form, not a list) per the data
 * model, but this phase's structural pattern still applies — the
 * empty-state copy is just worded for "nothing to configure yet"
 * rather than "no items yet".
 */
function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs page="Restaurant Settings" />
      <PageHeader
        title="Restaurant Settings"
        description="Manage your restaurant's general information and preferences."
        action={<ActionBar label="Save Changes" icon={Save} />}
      />
      <SectionContainer>
        <EmptyState
          icon={SettingsIcon}
          title="Nothing to configure yet."
          description="Restaurant settings will appear here once this section is built."
        />
      </SectionContainer>
    </div>
  );
}
