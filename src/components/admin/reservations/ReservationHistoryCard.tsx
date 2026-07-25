import { Loader2 } from "lucide-react";
import { ArrowRight } from "lucide-react";

import { ReservationStatusBadge } from "./ReservationStatusBadge";
import { useReservationHistory } from "@/hooks/useReservationHistory";
import type { ReservationStatusValue } from "@/services/reservations.service";

interface ReservationHistoryCardProps {
  reservationId: string;
}

export function ReservationHistoryCard({ reservationId }: ReservationHistoryCardProps) {
  const { history, isLoading } = useReservationHistory(reservationId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Loading history…
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <p className="py-3 text-sm text-muted-foreground">No status changes recorded yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
        >
          <div className="flex items-center gap-2 flex-1 flex-wrap">
            {entry.previousStatus ? (
              <>
                <ReservationStatusBadge status={entry.previousStatus as ReservationStatusValue} size="sm" />
                <ArrowRight className="size-3 text-muted-foreground shrink-0" />
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Created</span>
            )}
            <ReservationStatusBadge status={entry.newStatus as ReservationStatusValue} size="sm" />
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {new Date(entry.changedAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
