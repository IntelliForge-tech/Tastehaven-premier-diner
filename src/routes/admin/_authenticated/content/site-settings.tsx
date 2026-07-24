import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { AlertTriangle, Settings2 } from "lucide-react";
import { useRef } from "react";

import { SiteSettingsForm } from "@/components/admin/content/SiteSettingsForm";
import { SiteSettingsPreviewCard } from "@/components/admin/content/SiteSettingsPreviewCard";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { SiteSettings } from "@/services/site-settings.service";

export const Route = createFileRoute("/admin/_authenticated/content/site-settings")({
  component: AdminSiteSettingsPage,
  head: () => ({
    meta: [{ title: "Site Settings — Admin — Taste Haven" }],
  }),
});

function AdminSiteSettingsPage() {
  const { siteSettings, isLoading, error, refetch } = useSiteSettings();
  const isDirtyRef = useRef(false);

  useBlocker({
    blockerFn: () =>
      window.confirm(
        "You have unsaved changes to the site settings. Leave anyway and discard them?",
      ),
    condition: isDirtyRef.current,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Site Settings" />
        <PageHeader title="Site Settings" description="Manage SEO, analytics, branding, and global configuration." />
        <SiteSettingsPageSkeleton />
      </div>
    );
  }

  if (error && error.code !== "not_found") {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Site Settings" />
        <PageHeader title="Site Settings" description="Manage SEO, analytics, branding, and global configuration." />
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn&apos;t load site settings</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetch} className="mt-1 px-4 py-2">
              Try again
            </Button>
          </div>
        </SectionContainer>
      </div>
    );
  }

  const settingsData: SiteSettings = siteSettings ?? DEFAULT_SITE_SETTINGS;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Site Settings" />
      <PageHeader
        title="Site Settings"
        description="Manage SEO, analytics, branding, and global configuration."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <Settings2 className="size-3.5" aria-hidden="true" />
            Content Management
          </div>
        }
      />

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Current Configuration</h3>
        <SiteSettingsPreviewCard settings={settingsData} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">Edit Site Settings</h3>
        <SectionContainer>
          <SiteSettingsForm
            settings={settingsData}
            onSuccess={refetch}
            onDirtyChange={(dirty) => { isDirtyRef.current = dirty; }}
          />
        </SectionContainer>
      </div>
    </div>
  );
}

function SiteSettingsPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center gap-4 bg-muted/30 px-5 py-4">
          <div className="size-8 rounded bg-muted" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-3 w-48 rounded bg-muted" />
          </div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 border-t border-border px-5 py-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="h-4 w-40 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-28 rounded bg-muted" />
            <div className="h-10 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "",
  websiteName: "Taste Haven",
  websiteTagline: "Fresh ingredients, memorable experiences.",
  websiteDescription: "A modern dining haven where seasonal produce, wood-fire craftsmanship, and warm hospitality meet.",
  websiteUrl: null,
  defaultLanguage: "en",
  timezone: "America/Los_Angeles",
  businessCurrency: "USD",
  themeColor: null,
  primaryBrandColor: null,
  secondaryBrandColor: null,
  accentColor: null,

  metaTitle: "Taste Haven — Fresh Ingredients. Memorable Experiences.",
  metaDescription: "A modern dining haven where seasonal produce, wood-fire craftsmanship, and warm hospitality meet — night after night.",
  metaKeywords: null,
  canonicalUrl: null,
  author: null,
  publisher: null,
  robotsMeta: "index, follow",
  googleVerification: null,
  bingVerification: null,
  yandexVerification: null,
  facebookAppId: null,
  twitterUsername: null,
  ogTitle: null,
  ogDescription: null,
  ogImageUrl: null,
  twitterCardType: "summary_large_image",
  ogSiteName: "Taste Haven",
  ogType: "website",
  ogLocale: "en_US",

  faviconUrl: null,
  appleTouchIconUrl: null,
  browserThemeColor: null,
  backgroundColor: null,

  googleAnalyticsId: null,
  googleAnalyticsEnabled: false,
  googleTagManagerId: null,
  googleTagManagerEnabled: false,
  metaPixelId: null,
  metaPixelEnabled: false,
  microsoftClarityId: null,
  microsoftClarityEnabled: false,
  hotjarId: null,
  hotjarEnabled: false,
  customHeaderScript: null,
  customBodyScript: null,
  customFooterScript: null,

  allowIndexing: true,
  generateRobotsTxt: true,
  generateSitemap: true,
  enableStructuredData: true,
  enableLocalBusinessSchema: true,
  enableFaqSchema: true,
  enableOrganizationSchema: true,

  enablePwa: false,
  pwaAppName: "Taste Haven",
  pwaShortName: "Haven",
  pwaThemeColor: null,
  pwaBackgroundColor: null,
  pwaStartUrl: "/",
  pwaDisplayMode: "standalone",
  pwaOfflineSupport: false,

  enableAnimations: true,
  enableScrollToTop: true,
  enableCookieBanner: false,
  enableNewsletter: true,
  enableReservationSystem: true,
  enableContactForm: true,
  enableGallery: true,
  enableTestimonials: true,
  enableChefSection: true,
  enableOffers: true,

  maintenanceMode: false,
  maintenanceTitle: null,
  maintenanceMessage: null,
  maintenanceImageUrl: null,
  maintenanceExpectedReturn: null,
  allowSearchEnginesDuringMaintenance: true,

  updatedAt: "",
};
