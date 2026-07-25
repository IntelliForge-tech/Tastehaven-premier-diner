import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ReservationCalendar } from "@/components/admin/reservations/ReservationCalendar";
import { ReservationDetailsDrawer } from "@/components/admin/reservations/ReservationDetailsDrawer";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { useReservationsV2 } from "@/hooks/useReservationsV2";
import { useAuth } from "@/hooks/useAuth";
import type { ReservationItemV2 } from "@/services/reservations.service";

export const Route = createFileRoute(
  "/admin/_authenticated/reservations/calendar",
)({
  component: AdminReservationsCalendarPage,
  head: () => ({ meta: [{ title: "Calendar — Reservations — Admin — Taste Haven" }] }),
});

function AdminReservationsCalendarPage() {
  const { user } = useAuth();
  const { items, isLoading, refetch } = useReservationsV2({}, 1, 500);
  const [drawer, setDrawer] = useState<ReservationItemV2 | null>(null);

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Calendar" />
      <PageHeader
        title="Reservation Calendar"
        description="Visual month, week, and day views for all reservations."
      />

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-xl border border-border bg-muted" />
      ) : (
        <ReservationCalendar
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
