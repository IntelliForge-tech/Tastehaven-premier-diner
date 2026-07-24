import { createFileRoute } from "@tanstack/react-router";
import { Mail, RefreshCw } from "lucide-react";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/messages")({
  component: AdminMessagesPage,
  head: () => ({
    meta: [{ title: "Contact Messages — Admin — Taste Haven" }],
  }),
});

/** Placeholder page — structure only. No CRUD, Supabase, or API calls yet. */
function AdminMessagesPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs page="Contact Messages" />
      <PageHeader
        title="Contact Messages"
        description="View messages submitted through your contact form."
        action={<ActionBar label="Refresh" icon={RefreshCw} />}
      />
      <SectionContainer>
        <EmptyState
          icon={Mail}
          title="No messages yet."
          description="Messages submitted through your contact form will appear here."
        />
      </SectionContainer>
    </div>
  );
}
