import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { AlertTriangle, LayoutTemplate } from "lucide-react";
import { useRef } from "react";

import { AboutForm } from "@/components/admin/content/AboutForm";
import { AboutPreviewCard } from "@/components/admin/content/AboutPreviewCard";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useAbout } from "@/hooks/useAbout";
import { DEFAULT_FEATURES } from "@/services/about.service";
import type { AboutContent } from "@/services/about.service";

export const Route = createFileRoute("/admin/_authenticated/content/about")({
  component: AdminAboutPage,
  head: () => ({
    meta: [{ title: "About Section — Admin — Taste Haven" }],
  }),
});

/**
 * /admin/content/about — About Section CMS (Phase 12B).
 *
 * Page layout: breadcrumbs → header → live preview card → edit form.
 * Mirrors /admin/content/hero in structure — same loading/error/not-found
 * handling, same navigation blocker via onDirtyChange, same skeleton.
 */
function AdminAboutPage() {
  const { about, isLoading, error, refetch } = useAbout();
  const isDirtyRef = useRef(false);

  useBlocker({
    blockerFn: () =>
      window.confirm(
        "You have unsaved changes to the About section. Leave anyway and discard them?",
      ),
    condition: isDirtyRef.current,
  });

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="About Section" />
        <PageHeader
          title="About Section"
          description="Manage the homepage about content and section image."
        />
        <AboutPageSkeleton />
      </div>
    );
  }

  // ── Error (not "no row yet") ──────────────────────────────────────────
  if (error && error.code !== "not_found") {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="About Section" />
        <PageHeader
          title="About Section"
          description="Manage the homepage about content and section image."
        />
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn&apos;t load about settings
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button
              type="button"
              variant="outline-gold"
              onClick={refetch}
              className="mt-1 px-4 py-2"
            >
              Try again
            </Button>
          </div>
        </SectionContainer>
      </div>
    );
  }

  // "not_found" → no row yet. Pre-fill with the original hardcoded values
  // so the admin sees sensible defaults rather than empty fields.
  const aboutData: AboutContent = about ?? DEFAULT_ABOUT;

  // ── Main page ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Breadcrumbs page="About Section" />
      <PageHeader
        title="About Section"
        description="Manage the homepage about content and section image."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <LayoutTemplate className="size-3.5" aria-hidden="true" />
            Content Management
          </div>
        }
      />

      {/* Live preview */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Currently Published
        </h3>
        <AboutPreviewCard about={aboutData} />
      </div>

      {/* Edit form */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Edit About Content
        </h3>
        <SectionContainer>
          <AboutForm
            about={aboutData}
            onSuccess={refetch}
            onDirtyChange={(dirty) => {
              isDirtyRef.current = dirty;
            }}
          />
        </SectionContainer>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────

function AboutPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Preview card skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex bg-muted" style={{ minHeight: "180px" }}>
          <div className="w-1/2 space-y-3 p-5">
            <div className="h-3 w-20 rounded bg-muted-foreground/20" />
            <div className="h-5 w-48 rounded bg-muted-foreground/20" />
            <div className="h-3 w-full rounded bg-muted-foreground/20" />
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 rounded-lg bg-muted-foreground/20" />
              ))}
            </div>
          </div>
          <div className="w-1/2 bg-muted-foreground/10" />
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 px-5 py-3">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
      {/* Form skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="space-y-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3.5 w-28 rounded bg-muted" />
              <div className="h-10 w-full rounded-lg bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Default about data ────────────────────────────────────────────────────
// Mirrors the current hardcoded values in About.tsx and constants.ts so
// the form is pre-populated with sensible content on first load.

const DEFAULT_ABOUT: AboutContent = {
  id: "",
  sectionTitle: "Our Story",
  heading: "A haven for the curious palate.",
  description:
    "Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings. Every plate is a small ceremony.",
  features: DEFAULT_FEATURES,
  imageUrl: null,
  badgeYear: "2012",
  badgeText: "A decade of memorable evenings.",
  isVisible: true,
  updatedAt: "",
};
