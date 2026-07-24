import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { AlertTriangle, PanelBottom } from "lucide-react";
import { useRef } from "react";

import { FooterPreviewCard } from "@/components/admin/content/FooterPreviewCard";
import { FooterSettingsForm } from "@/components/admin/content/FooterSettingsForm";
import { QuickLinksManager } from "@/components/admin/content/QuickLinksManager";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useFooterSettings } from "@/hooks/useFooterSettings";
import { useQuickLinks } from "@/hooks/useQuickLinks";
import {
  DEFAULT_FOOTER_SETTINGS,
  DEFAULT_QUICK_LINKS,
} from "@/services/footer.service";

export const Route = createFileRoute("/admin/_authenticated/content/footer")({
  component: AdminFooterPage,
  head: () => ({
    meta: [{ title: "Footer — Admin — Taste Haven" }],
  }),
});

function AdminFooterPage() {
  const { settings, isLoading: settingsLoading, error: settingsError, refetch: refetchSettings } = useFooterSettings();
  const { links, isLoading: linksLoading, refetch: refetchLinks } = useQuickLinks();
  const isDirtyRef = useRef(false);

  useBlocker({
    blockerFn: () =>
      window.confirm("You have unsaved footer changes. Leave anyway and discard them?"),
    condition: isDirtyRef.current,
  });

  const isLoading = settingsLoading || linksLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Footer" />
        <PageHeader title="Footer" description="Manage footer content, quick links, newsletter, and appearance." />
        <FooterPageSkeleton />
      </div>
    );
  }

  if (settingsError && settingsError.code !== "not_found") {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Footer" />
        <PageHeader title="Footer" description="Manage footer content, quick links, newsletter, and appearance." />
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <p className="text-sm font-medium">Couldn&apos;t load footer settings</p>
            <p className="max-w-xs text-sm text-muted-foreground">{settingsError.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetchSettings} className="mt-1 px-4 py-2">
              Try again
            </Button>
          </div>
        </SectionContainer>
      </div>
    );
  }

  const footerData = settings ?? DEFAULT_FOOTER_SETTINGS;
  const linkData = links.length > 0 ? links : DEFAULT_QUICK_LINKS;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Footer" />
      <PageHeader
        title="Footer"
        description="Manage footer content, quick links, newsletter, and appearance."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <PanelBottom className="size-3.5" />
            Content Management
          </div>
        }
      />

      {/* Live preview */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Currently Published</h3>
        <FooterPreviewCard settings={footerData} links={links} />
      </div>

      {/* Quick Links */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Quick Links</h3>
        <SectionContainer>
          <p className="mb-4 text-sm text-muted-foreground">
            Drag rows to reorder. Changes apply to the public footer immediately on save.
          </p>
          <QuickLinksManager links={linkData} onRefetch={refetchLinks} />
        </SectionContainer>
      </div>

      {/* Settings form */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Footer Settings</h3>
        <SectionContainer>
          <FooterSettingsForm
            settings={footerData}
            onSuccess={refetchSettings}
            onDirtyChange={(dirty) => { isDirtyRef.current = dirty; }}
          />
        </SectionContainer>
      </div>
    </div>
  );
}

function FooterPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
          <div className="size-9 rounded-full bg-muted-foreground/20" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-muted-foreground/20" />
            <div className="h-3 w-24 rounded bg-muted-foreground/10" />
          </div>
        </div>
        <div className="grid grid-cols-4 divide-x divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3">
              <div className="size-4 rounded bg-muted" />
              <div className="h-3 w-16 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-28 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
