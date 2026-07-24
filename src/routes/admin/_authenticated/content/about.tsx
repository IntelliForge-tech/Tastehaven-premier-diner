import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { AlertTriangle, BookOpen } from "lucide-react";
import { useRef } from "react";

import { AboutForm } from "@/components/admin/content/AboutForm";
import { AboutPreviewCard } from "@/components/admin/content/AboutPreviewCard";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useAbout } from "@/hooks/useAbout";
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
 * Data fetching via useAbout(); save orchestration inside AboutForm via
 * useUpdateAbout(). Navigation blocker wired through onDirtyChange so
 * we never lift the form state up unnecessarily.
 *
 * Mirrors the AdminHeroPage structure from Phase 12A exactly.
 */
function AdminAboutPage() {
  const { about, isLoading, error, refetch } = useAbout();
  const isDirtyRef = useRef(false);

  // Block TanStack Router navigation when the form has unsaved changes.
  useBlocker({
    blockerFn: () =>
      window.confirm(
        "You have unsaved changes to the About section. Leave anyway and discard them?",
      ),
    condition: isDirtyRef.current,
  });

  // ── Loading state ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="About Section" />
        <PageHeader
          title="About Section"
          description="Manage the homepage about content and image."
        />
        <AboutPageSkeleton />
      </div>
    );
  }

  // ── Error state (not "no row yet") ────────────────────────────────────
  if (error && error.code !== "not_found") {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="About Section" />
        <PageHeader
          title="About Section"
          description="Manage the homepage about content and image."
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

  // Use loaded data or default values when no row exists yet (first-time setup).
  const aboutData: AboutContent = about ?? DEFAULT_ABOUT;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="About Section" />
      <PageHeader
        title="About Section"
        description="Manage the homepage about content and image."
      />

      {/* Live preview of currently published content */}
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
        <div className="bg-muted" style={{ aspectRatio: "16/5" }} />
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
          {[1, 2, 3, 4, 5].map((i) => (
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

// ── Default about data ─────────────────────────────────────────────────────
// Mirrors the current hardcoded values in About.tsx so the form is
// pre-populated with sensible content rather than empty fields.

const DEFAULT_ABOUT: AboutContent = {
  id: "",
  sectionTitle: "Our Story",
  headline: "A haven for the curious palate.",
  description:
    "Born from a love of the neighborhood market, Taste Haven brings together seasonal ingredients, global technique, and a room designed for slow, unhurried evenings. Every plate is a small ceremony.",
  badgeLabel: "Since",
  badgeYear: "2012",
  badgeSubtext: "A decade of memorable evenings.",
  imageUrl: null,
  features: [
    { icon: "fa-seedling", title: "Fresh Ingredients", description: "Sourced daily from local farms." },
    { icon: "fa-hat-chef", title: "Experienced Chefs", description: "A team with global training." },
    { icon: "fa-fire", title: "Cozy Atmosphere", description: "Warm lighting, intimate seating." },
    { icon: "fa-bolt", title: "Fast Service", description: "Attentive, never rushed." },
  ],
  isVisible: true,
  updatedAt: "",
};
