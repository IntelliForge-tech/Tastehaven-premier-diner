import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, Plus } from "lucide-react";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/faq")({
  component: AdminFaqPage,
  head: () => ({
    meta: [{ title: "FAQ — Admin — Taste Haven" }],
  }),
});

/** Placeholder page — structure only. No CRUD, Supabase, or API calls yet. */
function AdminFaqPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs page="FAQ" />
      <PageHeader
        title="FAQ"
        description="Manage frequently asked questions."
        action={<ActionBar label="Add FAQ" icon={Plus} />}
      />
      <SectionContainer>
        <EmptyState
          icon={HelpCircle}
          title="No FAQs yet."
          description="Questions will appear here once they are added."
        />
      </SectionContainer>
    </div>
  );
}
