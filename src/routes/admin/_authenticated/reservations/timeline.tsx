import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ReservationTimeline } from "@/components/admin/reservations/ReservationTimeline";
import { ReservationDetailsDrawer } from "@/components/admin/reservations/ReservationDetailsDrawer";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { useReservationsV2 } from "@/hooks/useReservationsV2";
import { useAuth } from "@/hooks/useAuth";
import type { ReservationItemV2 } from "@/services/reservations.service";

export const Route = createFileRoute(
  "/admin/_authenticated/reservations/timeline",
)({
  component: AdminReservationsTimelinePage,
  head: () => ({ meta: [{ title: "Timeline — Reservations — Admin — Taste Haven" }] }),
});

function AdminReservationsTimelinePage() {
  const { user } = useAuth();
  const { items, isLoading, refetch } = useReservationsV2({}, 1, 500);
  const [drawer, setDrawer] = useState<ReservationItemV2 | null>(null);

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Timeline" />
      <PageHeader
        title="Reservation Timeline"
        description="Hourly schedule view. See how reservations are distributed through the day."
      />

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-xl border border-border bg-muted" />
      ) : (
        <ReservationTimeline
          reservations={items}
          onSelectReservation={setDrawer}
        />
      )}

      {drawer && (
        <ReservationDetailsDrawer
          reservation={drawer}
          adminUserId={user?.id ?? ""}
          onClose={() => setDrawer(null)}
          onRefetch={() => { refetch(); setDrawer(null); }}
        />
      )}
    </div>
  );
}
