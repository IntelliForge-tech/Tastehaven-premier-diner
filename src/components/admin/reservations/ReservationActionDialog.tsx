import { Loader2 } from "lucide-react";
import type { MouseEvent } from "react";

import { ReservationStatusBadge } from "@/components/admin/reservations/ReservationStatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ReservationDetail, ReservationStatusValue } from "@/services/reservations.service";

export type ReservationActionType = "confirm" | "complete" | "cancel" | "delete";

interface ReservationActionConfig {
  title: string;
  description: string;
  confirmLabel: string;
  confirmClassName: string;
}

const ACTION_CONFIG: Record<ReservationActionType, ReservationActionConfig> = {
  confirm: {
    title: "Confirm this reservation?",
    description: "The reservation will be marked as Confirmed.",
    confirmLabel: "Confirm Reservation",
    confirmClassName:
      "bg-green-600 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70",
  },
  complete: {
    title: "Mark as Completed?",
    description: "The reservation will be marked as Completed. This cannot be reversed.",
    confirmLabel: "Mark Completed",
    confirmClassName:
      "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-70",
  },
  cancel: {
    title: "Cancel this reservation?",
    description: "The reservation will be marked as Cancelled. This cannot be reversed.",
    confirmLabel: "Cancel Reservation",
    confirmClassName:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-70",
  },
  delete: {
    title: "Delete this reservation?",
    description:
      "The reservation record will be permanently removed. This action cannot be undone.",
    confirmLabel: "Delete",
    confirmClassName:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-70",
  },
};

/** Formats "YYYY-MM-DD" → "MMM D, YYYY". */
function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Formats "HH:MM:SS" → "h:mm AM/PM". */
function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

interface ReservationActionDialogProps {
  /** null when the dialog should be closed. */
  reservation: ReservationDetail | null;
  action: ReservationActionType | null;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called when the admin confirms the action. */
  onConfirm: (e: MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Single reusable confirmation dialog for all reservation actions
 * (confirm, complete, cancel, delete). Shows customer name, reservation
 * date/time, and current status. The confirm button label, colour, and
 * description all change per action via ACTION_CONFIG — one component
 * instead of four, matching DeleteOfferDialog/DeleteChefDialog's
 * principle of minimal duplication.
 */
export function ReservationActionDialog({
  reservation,
  action,
  isLoading,
  onOpenChange,
  onConfirm,
}: ReservationActionDialogProps) {
  if (!action) return null;

  const config = ACTION_CONFIG[action];
  const isOpen = reservation !== null && action !== null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !isLoading && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>{config.description}</p>
              {reservation && (
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 space-y-1">
                  <p className="text-sm font-medium text-foreground">{reservation.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(reservation.reservationDate)} at{" "}
                    {formatTime(reservation.reservationTime)}
                  </p>
                  <div className="pt-0.5">
                    <ReservationStatusBadge status={reservation.status as ReservationStatusValue} />
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            aria-busy={isLoading}
            className={config.confirmClassName}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Processing…
              </span>
            ) : (
              config.confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
