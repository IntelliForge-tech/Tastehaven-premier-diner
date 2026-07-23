import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { AlertTriangle, LayoutTemplate } from "lucide-react";
import { useRef } from "react";

import { HeroForm } from "@/components/admin/content/HeroForm";
import { HeroPreviewCard } from "@/components/admin/content/HeroPreviewCard";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useHero } from "@/hooks/useHero";
import type { HeroContent } from "@/services/hero.service";

export const Route = createFileRoute("/admin/_authenticated/content/hero")({
  component: AdminHeroPage,
  head: () => ({
    meta: [{ title: "Hero Section — Admin — Taste Haven" }],
  }),
});

/**
 * /admin/content/hero — Hero Section CMS (Phase 12A).
 *
 * Page layout: breadcrumbs → header → live preview card → edit form.
 * Data fetching via useHero(); save orchestration inside HeroForm via
 * useUpdateHero(). Navigation blocker wired through onDirtyChange so
 * we never lift the form state up unnecessarily.
 */
function AdminHeroPage() {
  const { hero, isLoading, error, refetch } = useHero();
  const isDirtyRef = useRef(false);

  // Block TanStack Router navigation when the form has unsaved changes.
  useBlocker({
    blockerFn: () =>
      window.confirm(
        "You have unsaved changes to the Hero section. Leave anyway and discard them?",
      ),
    condition: isDirtyRef.current,
  });

  // ── Loading state ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Hero Section" />
        <PageHeader
          title="Hero Section"
          description="Manage the homepage hero content and background image."
        />
        <HeroPageSkeleton />
      </div>
    );
  }

  // ── Error state (not "no row yet") ────────────────────────────────────
  if (error && error.code !== "not_found") {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Hero Section" />
        <PageHeader
          title="Hero Section"
          description="Manage the homepage hero content and background image."
        />
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn&apos;t load hero settings
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

  // "not_found" → no row exists yet. Show defaults so the admin can
  // populate and save the first record without a blocking error state.
  const heroData: HeroContent = hero ?? DEFAULT_HERO;

  // ── Main page ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Breadcrumbs page="Hero Section" />
      <PageHeader
        title="Hero Section"
        description="Manage the homepage hero content and background image."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <LayoutTemplate className="size-3.5" aria-hidden="true" />
            Content Management
          </div>
        }
      />

      {/* Live preview of currently published content */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Currently Published
        </h3>
        <HeroPreviewCard hero={heroData} />
      </div>

      {/* Edit form */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Edit Hero Content
        </h3>
        <SectionContainer>
          <HeroForm
            hero={heroData}
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

function HeroPageSkeleton() {
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

// ── Default hero data ─────────────────────────────────────────────────────
// Mirrors the current hardcoded values in Hero.tsx so the form is
// pre-populated with sensible content rather than empty fields.

const DEFAULT_HERO: HeroContent = {
  id: "",
  headline: "Fresh Ingredients.",
  headlineHighlight: "Memorable",
  headlineSuffix: "Experiences.",
  badgeText: "Now taking reservations",
  description:
    "A modern dining haven where seasonal produce, wood-fire craftsmanship, and warm hospitality meet — night after night.",
  primaryButtonText: "Reserve Table",
  primaryButtonLink: "reserve",
  secondaryButtonText: "View Menu",
  secondaryButtonLink: "menu",
  backgroundImageUrl: null,
  overlayOpacity: 70,
  isVisible: true,
  updatedAt: "",
};
