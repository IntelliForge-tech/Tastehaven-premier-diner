import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { AlertTriangle, Store } from "lucide-react";
import { useRef } from "react";

import { RestaurantInformationForm } from "@/components/admin/content/RestaurantInformationForm";
import { RestaurantInformationPreviewCard } from "@/components/admin/content/RestaurantInformationPreviewCard";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useRestaurantInformation } from "@/hooks/useRestaurantInformation";
import {
  DEFAULT_OPENING_HOURS,
  DEFAULT_RESTAURANT_INFO,
} from "@/services/restaurant-information.service";
import type { RestaurantInformationData } from "@/services/restaurant-information.service";

export const Route = createFileRoute(
  "/admin/_authenticated/content/restaurant-information",
)({
  component: AdminRestaurantInformationPage,
  head: () => ({
    meta: [{ title: "Restaurant Information — Admin — Taste Haven" }],
  }),
});

/**
 * /admin/content/restaurant-information — Restaurant Information CMS (Phase 12C).
 *
 * Page layout: breadcrumbs → header → live preview card → edit form.
 * Mirrors /admin/content/about in structure — same loading/error/not-found
 * handling, same navigation blocker via onDirtyChange, same skeleton.
 */
function AdminRestaurantInformationPage() {
  const { data, isLoading, error, refetch } = useRestaurantInformation();
  const isDirtyRef = useRef(false);

  useBlocker({
    blockerFn: () =>
      window.confirm(
        "You have unsaved changes to the restaurant information. Leave anyway and discard them?",
      ),
    condition: isDirtyRef.current,
  });

  // ── Loading ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Restaurant Information" />
        <PageHeader
          title="Restaurant Information"
          description="Manage business details, contact information, and opening hours."
        />
        <RestaurantInformationSkeleton />
      </div>
    );
  }

  // ── Error (not "no row yet") ──────────────────────────────────────────
  if (error && error.code !== "not_found") {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Restaurant Information" />
        <PageHeader
          title="Restaurant Information"
          description="Manage business details, contact information, and opening hours."
        />
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn&apos;t load restaurant information
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

  // "not_found" → no row yet — pre-fill with defaults
  const infoData: RestaurantInformationData = data ?? {
    info: DEFAULT_RESTAURANT_INFO,
    hours: DEFAULT_OPENING_HOURS,
  };

  // ── Main page ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <Breadcrumbs page="Restaurant Information" />
      <PageHeader
        title="Restaurant Information"
        description="Manage business details, contact information, and opening hours."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
            <Store className="size-3.5" aria-hidden="true" />
            Content Management
          </div>
        }
      />

      {/* Live preview */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Currently Published
        </h3>
        <RestaurantInformationPreviewCard
          info={infoData.info}
          hours={infoData.hours}
        />
      </div>

      {/* Edit form */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Edit Restaurant Information
        </h3>
        <SectionContainer>
          <RestaurantInformationForm
            info={infoData.info}
            hours={infoData.hours}
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function RestaurantInformationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Preview card skeleton */}
      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
          <div className="size-9 rounded-full bg-muted-foreground/20" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded bg-muted-foreground/20" />
            <div className="h-3 w-24 rounded bg-muted-foreground/10" />
          </div>
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
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
