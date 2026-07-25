import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useCallback } from "react";

import { BulkActionsToolbar } from "@/components/admin/reservations/BulkActionsToolbar";
import { ReservationDetailsDrawer } from "@/components/admin/reservations/ReservationDetailsDrawer";
import { ReservationFiltersBar, ReservationSearch } from "@/components/admin/reservations/ReservationFilters";
import { ReservationOverviewCards } from "@/components/admin/reservations/ReservationOverviewCards";
import { ReservationStatusBadge } from "@/components/admin/reservations/ReservationStatusBadge";
import { ReservationsSkeleton } from "@/components/admin/reservations/ReservationsSkeleton";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useReservationAnalytics } from "@/hooks/useReservationAnalytics";
import { useReservationsV2 } from "@/hooks/useReservationsV2";
import { useAuth } from "@/hooks/useAuth";
import type {
  ReservationFilters,
  ReservationItemV2,
  ReservationStatusValue,
} from "@/services/reservations.service";
import { updateReservationStatus, STATUS_LABELS, STATUS_TRANSITIONS_V2, TERMINAL_STATUSES } from "@/services/reservations.service";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/_authenticated/reservations/")({
  component: AdminReservationsPage,
  head: () => ({ meta: [{ title: "Reservations — Admin — Taste Haven" }] }),
});

function AdminReservationsPage() {
  const { user } = useAuth();
  const adminUserId = user?.id ?? "";

  const [filters, setFilters] = useState<ReservationFilters>({ status: "all" });
  const [search, setSearch] = useState("");
  const [page] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<ReservationItemV2 | null>(null);

  const effectiveFilters: ReservationFilters = { ...filters, search: search || undefined };
  const { items, total, isLoading, error, refetch } = useReservationsV2(effectiveFilters, page, 100);
  const { analytics, isLoading: analyticsLoading } = useReservationAnalytics();

  const handleSearchChange = useCallback((v: string) => setSearch(v), []);
  const handleFiltersChange = useCallback((f: ReservationFilters) => setFilters(f), []);

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.length === items.length ? [] : items.map((i) => i.id),
    );
  }

  async function handleQuickStatus(r: ReservationItemV2, newStatus: ReservationStatusValue) {
    const result = await updateReservationStatus(r.id, newStatus);
    if (!result.success) {
      toast.error(result.error.message);
    } else {
      toast.success(`Marked as ${STATUS_LABELS[newStatus]}.`);
      refetch();
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Reservations" />
      <PageHeader
        title="Reservations"
        description="Manage all reservations, track status, and view analytics."
        action={
          <Button type="button" variant="outline-gold" onClick={refetch} className="gap-2 h-8 px-3 text-xs">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        }
      />

      {/* Overview cards */}
      {!analyticsLoading && analytics && (
        <ReservationOverviewCards analytics={analytics} />
      )}

      <SectionContainer>
        {/* Search + Filters */}
        <div className="space-y-3">
          <ReservationSearch value={search} onChange={handleSearchChange} />
          <ReservationFiltersBar filters={filters} onChange={handleFiltersChange} />
        </div>

        {/* Bulk toolbar */}
        <div className="mt-3">
          <BulkActionsToolbar
            selectedIds={selected}
            adminUserId={adminUserId}
            onClear={() => setSelected([])}
            onRefetch={refetch}
          />
        </div>

        {/* Table */}
        <div className="mt-4">
          {isLoading ? (
            <ReservationsSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <AlertTriangle className="size-8 text-destructive" />
              <p className="text-sm text-muted-foreground">{error.message}</p>
              <Button type="button" variant="outline-gold" onClick={refetch}>Retry</Button>
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No reservations found.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="w-10 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected.length === items.length && items.length > 0}
                        onChange={toggleSelectAll}
                        aria-label="Select all"
                        className="rounded border-border"
                      />
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Guest</th>
                    <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground sm:table-cell">Date & Time</th>
                    <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground md:table-cell">Guests</th>
                    <th className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="hidden px-3 py-2.5 text-left text-xs font-medium text-muted-foreground lg:table-cell">Table</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((r) => {
                    const transitions = STATUS_TRANSITIONS_V2[r.status as ReservationStatusValue] ?? [];
                    const isTerminal = TERMINAL_STATUSES.includes(r.status as ReservationStatusValue);
                    return (
                      <tr
                        key={r.id}
                        className={`group transition-colors hover:bg-muted/40 ${selected.includes(r.id) ? "bg-primary/5" : ""}`}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.includes(r.id)}
                            onChange={() => toggleSelect(r.id)}
                            aria-label={`Select ${r.customerName}`}
                            className="rounded border-border"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            type="button"
                            onClick={() => setDrawer(r)}
                            className="text-left"
                          >
                            <div className="font-medium hover:text-primary">{r.customerName}</div>
                            <div className="text-xs text-muted-foreground">{r.phone}</div>
                          </button>
                        </td>
                        <td className="hidden px-3 py-2.5 sm:table-cell">
                          <div className="font-medium">{fmtDate(r.reservationDate)}</div>
                          <div className="text-xs text-muted-foreground">{fmtTime(r.reservationTime)}</div>
                        </td>
                        <td className="hidden px-3 py-2.5 md:table-cell">{r.partySize}</td>
                        <td className="px-3 py-2.5">
                          <ReservationStatusBadge status={r.status as ReservationStatusValue} />
                        </td>
                        <td className="hidden px-3 py-2.5 lg:table-cell text-muted-foreground text-xs">
                          {r.tableNumber ?? "—"}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!isTerminal && transitions.slice(0, 2).map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => handleQuickStatus(r, s)}
                                className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium hover:bg-muted transition-colors"
                              >
                                {STATUS_LABELS[s]}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => setDrawer(r)}
                              className="rounded-md border border-border px-2 py-0.5 text-[10px] font-medium hover:bg-muted transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="border-t border-border bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
                Showing {items.length} of {total} reservations
              </div>
            </div>
          )}
        </div>
      </SectionContainer>

      {/* Drawer */}
      {drawer && (
        <ReservationDetailsDrawer
          reservation={drawer}
          adminUserId={adminUserId}
          onClose={() => setDrawer(null)}
          onRefetch={() => { refetch(); setDrawer(null); }}
        />
      )}
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtTime(t: string) {
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${mStr ?? "00"} ${suffix}`;
}
