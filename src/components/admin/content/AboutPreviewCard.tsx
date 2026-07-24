import { Eye, EyeOff } from "lucide-react";

import { Card } from "@/components/common/Card";
import type { AboutContent } from "@/services/about.service";

interface AboutPreviewCardProps {
  about: AboutContent;
}

/**
 * Read-only snapshot of the currently saved About content, displayed
 * above the form on /admin/content/about. Shows the same fields that
 * will appear on the public site so the admin can confirm the live
 * state before editing.
 *
 * Intentionally lightweight — this is a dashboard summary card, not a
 * pixel-perfect replica of the public About section. Full visual fidelity
 * lives in the actual public About component.
 */
export function AboutPreviewCard({ about }: AboutPreviewCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Image thumbnail */}
      <div
        className="relative flex min-h-40 items-end bg-muted"
        style={{ aspectRatio: "16/5" }}
      >
        {about.imageUrl ? (
          <img
            src={about.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <span className="text-sm">No about image set</span>
          </div>
        )}

        {/* Simulated overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />

        {/* Simulated heading overlay */}
        <div className="relative z-10 p-4">
          {about.sectionTitle && (
            <div className="mb-1 text-xs uppercase tracking-widest text-white/60">
              {about.sectionTitle}
            </div>
          )}
          <h2 className="font-display text-xl font-semibold leading-tight text-white drop-shadow sm:text-2xl">
            {about.headline}
          </h2>
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

      {/* Field summary */}
      <div className="divide-y divide-border">
        {[
          { label: "Section Label", value: about.sectionTitle },
          { label: "Description", value: about.description },
          {
            label: "Badge",
            value:
              about.badgeLabel || about.badgeYear
                ? [about.badgeLabel, about.badgeYear].filter(Boolean).join(" · ")
                : null,
          },
          {
            label: "Feature Cards",
            value:
              about.features.length > 0
                ? about.features.map((f) => f.title).join(", ")
                : null,
          },
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
