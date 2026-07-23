import { Eye, EyeOff } from "lucide-react";

import { Card } from "@/components/common/Card";
import type { HeroContent } from "@/services/hero.service";

interface HeroPreviewCardProps {
  hero: HeroContent;
}

/**
 * Read-only snapshot of the currently saved Hero content, displayed
 * above the form on /admin/content/hero. Shows the same fields that
 * will appear on the public site so the admin can confirm the live
 * state before editing.
 *
 * Intentionally lightweight — this is a dashboard summary card, not a
 * pixel-perfect replica of the public Hero section. Full visual fidelity
 * lives in the actual public Hero component.
 */
export function HeroPreviewCard({ hero }: HeroPreviewCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Thumbnail */}
      <div
        className="relative flex min-h-40 items-end bg-muted"
        style={{ aspectRatio: "16/5" }}
      >
        {hero.backgroundImageUrl ? (
          <img
            src={hero.backgroundImageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <span className="text-sm">No background image set</span>
          </div>
        )}

        {/* Simulated overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background/90"
          style={{ opacity: hero.overlayOpacity / 100 }}
        />

        {/* Simulated hero text */}
        <div className="relative z-10 p-4">
          {hero.badgeText && (
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs uppercase tracking-widest text-white/80 backdrop-blur">
              <span className="size-1.5 rounded-full bg-yellow-400" />
              {hero.badgeText}
            </div>
          )}

          <h2 className="font-display text-xl font-semibold leading-tight text-white drop-shadow sm:text-2xl">
            {hero.headline}
            {(hero.headlineHighlight || hero.headlineSuffix) && (
              <>
                <br />
                {hero.headlineHighlight && (
                  <span className="text-gradient-gold">{hero.headlineHighlight}</span>
                )}
                {hero.headlineSuffix && (
                  <span> {hero.headlineSuffix}</span>
                )}
              </>
            )}
          </h2>
        </div>

        {/* Visibility badge */}
        <div
          className={[
            "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            hero.isVisible
              ? "bg-emerald-500/90 text-white"
              : "bg-muted/90 text-muted-foreground",
          ].join(" ")}
        >
          {hero.isVisible ? (
            <>
              <Eye className="size-3" aria-hidden="true" />
              Visible
            </>
          ) : (
            <>
              <EyeOff className="size-3" aria-hidden="true" />
              Hidden
            </>
          )}
        </div>
      </div>

      {/* Field summary */}
      <div className="divide-y divide-border">
        {[
          { label: "Description", value: hero.description },
          {
            label: "Primary Button",
            value:
              hero.primaryButtonText
                ? `${hero.primaryButtonText} → ${hero.primaryButtonLink || "—"}`
                : null,
          },
          {
            label: "Secondary Button",
            value:
              hero.secondaryButtonText
                ? `${hero.secondaryButtonText} → ${hero.secondaryButtonLink || "—"}`
                : null,
          },
          { label: "Overlay Opacity", value: `${hero.overlayOpacity}%` },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-4 px-5 py-3 text-sm">
            <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
            <span className="text-foreground">
              {value ?? <span className="italic text-muted-foreground">Not set</span>}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
