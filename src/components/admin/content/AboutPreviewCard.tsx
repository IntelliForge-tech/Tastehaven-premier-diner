import { Eye, EyeOff } from "lucide-react";

import { Card } from "@/components/common/Card";
import type { AboutContent } from "@/services/about.service";

interface AboutPreviewCardProps {
  about: AboutContent;
}

/**
 * Read-only snapshot of the currently saved About content, displayed
 * above the form on /admin/content/about. Mirrors HeroPreviewCard in
 * structure: a visual thumbnail, visibility badge, and a field summary
 * table below it. Intentionally lightweight — full visual fidelity
 * lives in the public About component.
 */
export function AboutPreviewCard({ about }: AboutPreviewCardProps) {
  const showBadge = about.badgeYear || about.badgeText;

  return (
    <Card className="overflow-hidden">
      {/* Image thumbnail with simulated layout */}
      <div className="relative flex bg-muted" style={{ minHeight: "180px" }}>
        {/* Left column — text preview */}
        <div className="flex w-1/2 flex-col justify-center gap-2 p-5">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-primary">
            <span className="h-px w-5 bg-primary" />
            {about.sectionTitle}
          </div>
          <p className="font-display text-base font-semibold leading-snug text-foreground line-clamp-2">
            {about.heading}
          </p>
          {about.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{about.description}</p>
          )}

          {/* Mini feature grid */}
          {about.features.length > 0 && (
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {about.features.slice(0, 4).map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-card/50 px-2 py-1.5"
                >
                  <i
                    className={`fa-solid fa-${f.icon} text-[10px] text-primary`}
                    aria-hidden="true"
                  />
                  <span className="truncate text-[10px] font-medium">{f.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column — image thumbnail */}
        <div className="relative w-1/2">
          {about.imageUrl ? (
            <img
              src={about.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
              <span className="text-xs text-muted-foreground">No image set</span>
            </div>
          )}

          {/* Simulated decorative badge */}
          {showBadge && (
            <div className="absolute -bottom-0 left-0 m-3 hidden w-36 rounded-xl border border-border/40 bg-card/80 p-3 shadow backdrop-blur sm:block">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Since
              </div>
              {about.badgeYear && (
                <div className="font-display text-2xl text-gradient-gold">{about.badgeYear}</div>
              )}
              {about.badgeText && (
                <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground line-clamp-2">
                  {about.badgeText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Visibility badge */}
        <div
          className={[
            "absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            about.isVisible
              ? "bg-emerald-500/90 text-white"
              : "bg-muted/90 text-muted-foreground",
          ].join(" ")}
        >
          {about.isVisible ? (
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

      {/* Field summary table */}
      <div className="divide-y divide-border">
        {[
          { label: "Section Label", value: about.sectionTitle },
          { label: "Heading", value: about.heading },
          {
            label: "Feature Cards",
            value:
              about.features.length > 0
                ? about.features.map((f) => f.title).join(", ")
                : null,
          },
          {
            label: "Decorative Badge",
            value: showBadge ? `${about.badgeYear ?? ""} — ${about.badgeText ?? ""}`.trim().replace(/^—\s*/, "") : null,
          },
        ].map(({ label, value }) => (
          <div key={label} className="flex gap-4 px-5 py-3 text-sm">
            <span className="w-36 shrink-0 text-muted-foreground">{label}</span>
            <span className="text-foreground line-clamp-1">
              {value ?? <span className="italic text-muted-foreground">Not set</span>}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
