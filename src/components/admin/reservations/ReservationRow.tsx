import { Eye, Pencil, Trash2 } from "lucide-react";

import { ReservationStatusBadge } from "@/components/admin/reservations/ReservationStatusBadge";
import { Button } from "@/components/common/Button";
import type { ReservationItem } from "@/services/reservations.service";

const DELETABLE_STATUSES: ReservationItem["status"][] = ["completed", "cancelled", "no_show"];

interface ReservationRowProps {
  reservation: ReservationItem;
  /** Navigate to the detail page for this reservation. */
  onView: (id: string) => void;
  /** Navigate to the detail page for editing (same route as view). */
  onEdit: (id: string) => void;
  /** Open the delete confirmation dialog for this reservation. */
  onDelete: (reservation: ReservationItem) => void;
}

/** Formats a DB time string "HH:MM:SS" to "h:mm AM/PM" for display. */
function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

/** Formats a DB date string "YYYY-MM-DD" to "MMM D, YYYY" for display. */
function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * One row in the Reservations table. Displays only columns that exist
 * in database.types.ts — no invented fields. `admin_notes` is
 * intentionally excluded (internal, belongs on the detail page).
 * View and Edit navigate to the detail page; Delete opens the
 * confirmation dialog (terminal statuses only).
 */
export function ReservationRow({ reservation, onView, onEdit, onDelete }: ReservationRowProps) {
  const canDelete = DELETABLE_STATUSES.includes(reservation.status);
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Customer */}
      <td className="px-4 py-3">
        <p className="font-medium text-foreground leading-snug">{reservation.customerName}</p>
        <p className="text-xs text-muted-foreground">{reservation.email}</p>
        <p className="text-xs text-muted-foreground">{reservation.phone}</p>
      </td>

      {/* Date & Time */}
      <td className="px-4 py-3 whitespace-nowrap">
        <p className="text-sm text-foreground">{formatDate(reservation.reservationDate)}</p>
        <p className="text-xs text-muted-foreground">{formatTime(reservation.reservationTime)}</p>
      </td>

      {/* Party Size */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-foreground">{reservation.partySize}</span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <ReservationStatusBadge status={reservation.status} />
      </td>

      {/* Special Request — truncated */}
      <td className="px-4 py-3 max-w-[200px] hidden lg:table-cell">
        {reservation.specialRequest ? (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {reservation.specialRequest}
          </p>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </td>

      {/* Created */}
      <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">
        <p className="text-xs text-muted-foreground">
          {new Date(reservation.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 justify-end">
          <Button
            type="button"
            variant="outline"
            aria-label={`View reservation for ${reservation.customerName}`}
            onClick={() => onView(reservation.id)}
            className="inline-flex size-8 items-center justify-center p-0"
          >
            <Eye className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label={`Edit reservation for ${reservation.customerName}`}
            onClick={() => onEdit(reservation.id)}
            className="inline-flex size-8 items-center justify-center p-0"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!canDelete}
            aria-label={`Delete reservation for ${reservation.customerName}`}
            onClick={() => onDelete(reservation)}
            className="inline-flex size-8 items-center justify-center p-0 text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
