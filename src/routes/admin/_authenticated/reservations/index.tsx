import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, CalendarCheck } from "lucide-react";

import { ReservationRow } from "@/components/admin/reservations/ReservationRow";
import { ReservationsSkeleton } from "@/components/admin/reservations/ReservationsSkeleton";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useReservations } from "@/hooks/useReservations";

export const Route = createFileRoute("/admin/_authenticated/reservations/")({
  component: AdminReservationsPage,
  head: () => ({
    meta: [{ title: "Reservations — Admin — Taste Haven" }],
  }),
});

function AdminReservationsPage() {
  const { items, isLoading, error, refetch } = useReservations();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Reservations" />
      <PageHeader title="Reservations" description="View and manage guest reservations." />
      <SectionContainer>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <ReservationsTableHead />
              <tbody>
                <ReservationsSkeleton />
              </tbody>
            </table>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn&apos;t load reservations</p>
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
        ) : items.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="No reservations yet."
            description="Reservations will appear here once guests start booking."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <ReservationsTableHead />
              <tbody>
                {items.map((reservation) => (
                  <ReservationRow
                    key={reservation.id}
                    reservation={reservation}
                    onView={(id) =>
                      navigate({
                        to: "/admin/reservations/$reservationId",
                        params: { reservationId: id },
                      })
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionContainer>
    </div>
  );
}

function ReservationsTableHead() {
  return (
    <thead>
      <tr className="border-b border-border text-left">
        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Customer
        </th>
        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
          Date &amp; Time
        </th>
        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
          Guests
        </th>
        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Status
        </th>
        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
          Request
        </th>
        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden xl:table-cell">
          Received
        </th>
        <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">
          Actions
        </th>
      </tr>
    </thead>
  );
}
