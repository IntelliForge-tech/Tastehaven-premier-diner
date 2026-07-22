import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle, Trash2, XCircle } from "lucide-react";
import type { MouseEvent } from "react";
import { useState } from "react";
import { toast } from "sonner";

import {
  ReservationActionDialog,
  type ReservationActionType,
} from "@/components/admin/reservations/ReservationActionDialog";
import { ReservationStatusBadge } from "@/components/admin/reservations/ReservationStatusBadge";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useReservation } from "@/hooks/useReservation";
import { useUpdateReservationStatus } from "@/hooks/useUpdateReservationStatus";
import { useDeleteReservation } from "@/hooks/useDeleteReservation";
import {
  STATUS_TRANSITIONS,
  type ReservationDetail,
  type ReservationStatusValue,
} from "@/services/reservations.service";

export const Route = createFileRoute("/admin/_authenticated/reservations/$reservationId")({
  component: AdminReservationDetailPage,
  head: () => ({
    meta: [{ title: "Reservation Details — Admin — Taste Haven" }],
  }),
});

/** Formats "YYYY-MM-DD" → "Monday, January 15, 2025". */
function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Formats "HH:MM:SS" → "7:30 PM". */
function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

/** Formats an ISO timestamp for human-readable metadata display. */
function formatTimestamp(ts: string): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function AdminReservationDetailPage() {
  const { reservationId } = Route.useParams();
  const { reservation, isLoading, error, refetch } = useReservation(reservationId);
  const navigate = useNavigate();
  const { user } = useAuth();

  const { isUpdating, updateStatus } = useUpdateReservationStatus();
  const { isDeleting, deleteItem } = useDeleteReservation();

  const [pendingAction, setPendingAction] = useState<ReservationActionType | null>(null);

  const isBusy = isUpdating || isDeleting;

  function goToList() {
    navigate({ to: "/admin/reservations" });
  }

  async function handleConfirm(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!reservation || !pendingAction) return;

    if (pendingAction === "delete") {
      const result = await deleteItem(reservation.id, reservation.status);
      if (!result.success) {
        toast.error(result.error.message);
        return;
      }
      toast.success("Reservation deleted.");
      setPendingAction(null);
      goToList();
      return;
    }

    const statusMap: Record<Exclude<ReservationActionType, "delete">, ReservationStatusValue> = {
      confirm: "confirmed",
      complete: "completed",
      cancel: "cancelled",
    };

    const newStatus = statusMap[pendingAction];
    const result = await updateStatus(
      reservation.id,
      newStatus,
      reservation.status,
      user?.id ?? "",
    );

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    const successMessages: Record<string, string> = {
      confirm: "Reservation confirmed.",
      complete: "Reservation marked as completed.",
      cancel: "Reservation cancelled.",
    };

    toast.success(successMessages[pendingAction]);
    setPendingAction(null);
    refetch();
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Reservation Details" />
      <PageHeader
        title="Reservation Details"
        description="View the full details of this reservation."
      />

      {isLoading ? (
        <ReservationDetailSkeleton />
      ) : error ? (
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn&apos;t load this reservation
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <div className="mt-1 flex gap-3">
              {error.code !== "not_found" && (
                <Button
                  type="button"
                  variant="outline-gold"
                  onClick={refetch}
                  className="px-4 py-2"
                >
                  Try again
                </Button>
              )}
              <Button type="button" variant="outline" onClick={goToList} className="px-4 py-2">
                Back to Reservations
              </Button>
            </div>
          </div>
        </SectionContainer>
      ) : reservation ? (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={goToList}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to Reservations
          </Button>

          {/* Status header card */}
          <SectionContainer>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {reservation.customerName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(reservation.reservationDate)} at{" "}
                  {formatTime(reservation.reservationTime)}
                </p>
              </div>
              <ReservationStatusBadge status={reservation.status} />
            </div>
          </SectionContainer>

          {/* Actions card — only shown when the status has available transitions */}
          <ReservationActions
            reservation={reservation}
            isBusy={isBusy}
            onAction={setPendingAction}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <SectionContainer>
              <DetailSection title="Customer Information">
                <DetailField label="Name" value={reservation.customerName} />
                <DetailField label="Email" value={reservation.email} />
                <DetailField label="Phone" value={reservation.phone} />
              </DetailSection>
            </SectionContainer>

            <SectionContainer>
              <DetailSection title="Reservation">
                <DetailField label="Date" value={formatDate(reservation.reservationDate)} />
                <DetailField label="Time" value={formatTime(reservation.reservationTime)} />
                <DetailField
                  label="Party Size"
                  value={`${reservation.partySize} guest${reservation.partySize !== 1 ? "s" : ""}`}
                />
                <DetailField label="Status">
                  <ReservationStatusBadge status={reservation.status} />
                </DetailField>
                {reservation.confirmedAt && (
                  <DetailField
                    label="Confirmed At"
                    value={formatTimestamp(reservation.confirmedAt)}
                  />
                )}
              </DetailSection>
            </SectionContainer>
          </div>

          {(reservation.specialRequest || reservation.adminNotes) && (
            <SectionContainer>
              <DetailSection title="Additional Information">
                {reservation.specialRequest && (
                  <DetailField label="Special Request" value={reservation.specialRequest} />
                )}
                {reservation.adminNotes && (
                  <DetailField label="Admin Notes" value={reservation.adminNotes} />
                )}
              </DetailSection>
            </SectionContainer>
          )}

          <SectionContainer>
            <DetailSection title="Metadata">
              <DetailField label="Received" value={formatTimestamp(reservation.createdAt)} />
              <DetailField label="Last Updated" value={formatTimestamp(reservation.updatedAt)} />
              <DetailField label="Reference ID">
                <code className="text-xs text-muted-foreground font-mono break-all">
                  {reservation.id}
                </code>
              </DetailField>
            </DetailSection>
          </SectionContainer>
        </div>
      ) : null}

      <ReservationActionDialog
        reservation={reservation ?? null}
        action={pendingAction}
        isLoading={isBusy}
        onOpenChange={(open) => !open && setPendingAction(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

// ============================================================================
// Actions panel
// ============================================================================

interface ReservationActionsProps {
  reservation: ReservationDetail;
  isBusy: boolean;
  onAction: (action: ReservationActionType) => void;
}

/**
 * Shows available action buttons based on the current status.
 * Renders nothing for terminal states (completed, cancelled, no_show)
 * that have no allowed transitions — the delete button is available for
 * those states since the business still needs to be able to remove old
 * records. For active states (pending, confirmed) delete is not shown
 * so admins can't accidentally destroy live reservations.
 */
function ReservationActions({ reservation, isBusy, onAction }: ReservationActionsProps) {
  const allowed = STATUS_TRANSITIONS[reservation.status];
  const isTerminal = allowed.length === 0;

  // Show nothing for terminal states that also shouldn't be deleted
  // (none right now — all three terminal states allow delete).
  const canDelete = isTerminal;

  if (!isTerminal && allowed.length === 0 && !canDelete) return null;

  return (
    <SectionContainer>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Actions
        </span>

        {allowed.includes("confirmed") && (
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onAction("confirm")}
            className="inline-flex items-center gap-2 border-green-600/40 text-green-700 hover:bg-green-50 hover:border-green-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-green-400"
          >
            <CheckCircle className="size-4" aria-hidden="true" />
            Confirm
          </Button>
        )}

        {allowed.includes("completed") && (
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onAction("complete")}
            className="inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle className="size-4" aria-hidden="true" />
            Mark Completed
          </Button>
        )}

        {allowed.includes("cancelled") && (
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onAction("cancel")}
            className="inline-flex items-center gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="size-4" aria-hidden="true" />
            Cancel
          </Button>
        )}

        {canDelete && (
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onAction("delete")}
            className="ml-auto inline-flex items-center gap-2 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete Record
          </Button>
        )}

        {isTerminal && !canDelete && (
          <span className="text-sm text-muted-foreground">No further actions available.</span>
        )}
      </div>
    </SectionContainer>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">{title}</h3>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
}

function DetailField({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wide w-32 shrink-0 pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-foreground">
        {children ?? value ?? <span className="text-muted-foreground/50">—</span>}
      </dd>
    </div>
  );
}

function ReservationDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-44" />
      <SectionContainer>
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </SectionContainer>
      <SectionContainer>
        <div className="flex gap-3">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </SectionContainer>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionContainer>
          <Skeleton className="h-4 w-36 mb-3" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </SectionContainer>
        <SectionContainer>
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </SectionContainer>
      </div>
      <SectionContainer>
        <Skeleton className="h-4 w-20 mb-3" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-64" />
        </div>
      </SectionContainer>
    </div>
  );
}
