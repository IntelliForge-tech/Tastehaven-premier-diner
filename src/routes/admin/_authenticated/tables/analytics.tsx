import { createFileRoute } from "@tanstack/react-router";

import { OccupancyDashboard } from "@/components/admin/tables/OccupancyDashboard";
import { TableAnalyticsCards } from "@/components/admin/tables/TableAnalyticsCards";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { useFloorAnalytics } from "@/hooks/useFloorAnalytics";
import { useFloors } from "@/hooks/useFloors";
import { useTables } from "@/hooks/useTables";
import { useTableAssignments } from "@/hooks/useTableAssignments";

export const Route = createFileRoute("/admin/_authenticated/tables/analytics")({
  component: AdminTableAnalyticsPage,
  head: () => ({
    meta: [{ title: "Table Analytics — Admin — Taste Haven" }],
  }),
});

function AdminTableAnalyticsPage() {
  const { floors, isLoading: floorsLoading } = useFloors();
  const { tables, isLoading: tablesLoading } = useTables();
  const { assignments, isLoading: assignmentsLoading } = useTableAssignments();

  const analytics = useFloorAnalytics(floors, tables, assignments);

  const isLoading = floorsLoading || tablesLoading || assignmentsLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Table Analytics" />
      <PageHeader
        title="Table Analytics"
        description="Occupancy rates, status breakdown, and per-floor performance overview."
      />

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <>
          <TableAnalyticsCards analytics={analytics} />

          <div className="mt-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Live Occupancy Detail
            </h2>
            <OccupancyDashboard tables={tables} analytics={analytics} />
          </div>
        </>
      )}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-muted" />
        ))}
      </div>
      <div className="h-32 rounded-xl border border-border bg-muted" />
      <div className="h-48 rounded-xl border border-border bg-muted" />
    </div>
  );
}
