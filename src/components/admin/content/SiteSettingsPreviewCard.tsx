import { Globe, Search, Settings2 } from "lucide-react";

import { Card } from "@/components/common/Card";
import type { SiteSettings } from "@/services/site-settings.service";

interface SiteSettingsPreviewCardProps {
  settings: SiteSettings;
}

/**
 * Read-only summary of the currently saved Site Settings, displayed
 * above the form on /admin/content/site-settings. Mirrors the
 * HeroPreviewCard and AboutPreviewCard pattern.
 */
export function SiteSettingsPreviewCard({ settings }: SiteSettingsPreviewCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-5 py-4">
        {settings.faviconUrl ? (
          <img src={settings.faviconUrl} alt="favicon" className="size-8 rounded object-contain" />
        ) : (
          <div className="grid size-8 place-items-center rounded bg-primary/15 text-primary">
            <Globe className="size-4" aria-hidden="true" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground">{settings.websiteName}</p>
          {settings.websiteTagline && (
            <p className="text-xs text-muted-foreground">{settings.websiteTagline}</p>
          )}
        </div>
        {settings.maintenanceMode && (
          <div className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Settings2 className="size-3" aria-hidden="true" />
            Maintenance Mode Active
          </div>
        )}
      </div>

      {/* SERP preview */}
      <div className="border-b border-border bg-card/50 px-5 py-4">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Search className="size-3" aria-hidden="true" />
          Search result preview
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-sm font-medium text-blue-500 line-clamp-1">{settings.metaTitle}</p>
          {settings.websiteUrl && (
            <p className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400">
              {settings.websiteUrl}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {settings.metaDescription}
          </p>
        </div>
      </div>

      {/* Field summary */}
      <div className="divide-y divide-border">
        {[
          {
            label: "Language",
            value: `${settings.defaultLanguage} · ${settings.timezone} · ${settings.businessCurrency}`,
          },
          {
            label: "Indexing",
            value: settings.allowIndexing ? "Indexed · Follow" : "No-index",
          },
          {
            label: "Analytics",
            value: [
              settings.googleAnalyticsEnabled && settings.googleAnalyticsId ? "GA4" : null,
              settings.googleTagManagerEnabled && settings.googleTagManagerId ? "GTM" : null,
              settings.metaPixelEnabled && settings.metaPixelId ? "Meta Pixel" : null,
              settings.microsoftClarityEnabled && settings.microsoftClarityId ? "Clarity" : null,
              settings.hotjarEnabled && settings.hotjarId ? "Hotjar" : null,
            ]
              .filter(Boolean)
              .join(", ") || "None enabled",
          },
          {
            label: "PWA",
            value: settings.enablePwa ? `Enabled — ${settings.pwaDisplayMode ?? "standalone"}` : "Disabled",
          },
          {
            label: "Maintenance",
            value: settings.maintenanceMode ? "ACTIVE" : "Off",
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-4 px-5 py-3 text-sm">
            <span className="w-32 shrink-0 text-muted-foreground">{label}</span>
            <span className="text-foreground line-clamp-1">{value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
