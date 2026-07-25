import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, type ReservationStatusValue } from "@/services/reservations.service";

interface ReservationStatusBadgeProps {
  status: ReservationStatusValue;
  size?: "sm" | "md";
}

/**
 * Phase 13A: Supports all 7 statuses including checked_in and seated.
 * Color mapping lives in reservations.service.ts (STATUS_COLORS) so both
 * the badge and any other UI consuming status colors stay in sync.
 */
export function ReservationStatusBadge({ status, size = "md" }: ReservationStatusBadgeProps) {
  const label = STATUS_LABELS[status] ?? status;
  const className = STATUS_COLORS[status] ?? "bg-secondary text-secondary-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        className,
      )}
    >
      {label}
    </span>
  );
}
