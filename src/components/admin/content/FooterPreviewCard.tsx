import { Eye, EyeOff, Globe, Link, Mail, Newspaper } from "lucide-react";

import type { FooterSettings } from "@/services/footer.service";
import type { QuickLink } from "@/services/footer.service";

interface FooterPreviewCardProps {
  settings: FooterSettings;
  links: QuickLink[];
}

/**
 * Read-only preview of current footer settings.
 * Mirrors RestaurantInformationPreviewCard structure.
 */
export function FooterPreviewCard({ settings, links }: FooterPreviewCardProps) {
  const copyrightYear = settings.copyrightYearAuto
    ? new Date().getFullYear()
    : settings.copyrightYearManual ?? new Date().getFullYear();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Globe className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base font-semibold leading-tight truncate">
            {settings.restaurantName ?? "Taste Haven"}
          </p>
          {settings.tagline && (
            <p className="text-xs text-muted-foreground truncate">{settings.tagline}</p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <StatusBadge label={settings.footerLayout} />
          <VisibilityBadge enabled={settings.footerEnabled} label="Footer" />
        </div>
      </div>

      {/* Sections overview */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-4">
        <SectionToggle
          icon={<Link className="size-3.5" />}
          label="Quick Links"
          enabled={settings.showQuickLinks}
          detail={`${links.filter((l) => l.isEnabled).length} links`}
        />
        <SectionToggle
          icon={<Newspaper className="size-3.5" />}
          label="Newsletter"
          enabled={settings.showNewsletter && settings.newsletterEnabled}
          detail={settings.newsletterButtonText ?? "Join"}
        />
        <SectionToggle
          icon={<Mail className="size-3.5" />}
          label="Social"
          enabled={settings.showSocialIcons}
          detail={`${settings.socialIconShape} · ${settings.socialIconSize}`}
        />
        <SectionToggle
          icon={<Globe className="size-3.5" />}
          label="Legal"
          enabled={settings.showLegal}
          detail={settings.showCopyright ? `© ${copyrightYear}` : "Hidden"}
        />
      </div>

      {/* Quick links list */}
      {links.length > 0 && (
        <div className="border-t border-border px-5 py-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Quick Links</p>
          <div className="flex flex-wrap gap-1.5">
            {links
              .filter((l) => l.isEnabled)
              .slice(0, 8)
              .map((l) => (
                <span
                  key={l.id}
                  className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {l.title}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Copyright bar */}
      <div className="border-t border-border bg-muted/20 px-5 py-2.5 flex items-center justify-between gap-4">
        <span className="text-xs text-muted-foreground">
          © {copyrightYear} {settings.restaurantName ?? "Taste Haven"}
          {settings.copyrightText ? `. ${settings.copyrightText}` : ""}
        </span>
        {settings.designedByText && (
          <span className="text-xs text-muted-foreground">{settings.designedByText}</span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-xs capitalize text-muted-foreground">
      {label}
    </span>
  );
}

function VisibilityBadge({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${
        enabled
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      {enabled ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
      {label}
    </span>
  );
}

function SectionToggle({
  icon,
  label,
  enabled,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
  detail?: string;
}) {
  return (
    <div className={`flex flex-col items-center gap-1 p-3 text-center ${!enabled ? "opacity-40" : ""}`}>
      <div className="text-muted-foreground">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
      {detail && <span className="text-[10px] text-muted-foreground">{detail}</span>}
    </div>
  );
}
