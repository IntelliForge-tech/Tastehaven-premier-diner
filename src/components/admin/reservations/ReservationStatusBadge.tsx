import { cn } from "@/lib/utils";
import type { ReservationStatusValue } from "@/services/reservations.service";

interface ReservationStatusBadgeProps {
  status: ReservationStatusValue;
}

/**
 * Colored status badge for the five reservation_status enum values:
 * pending | confirmed | completed | cancelled | no_show.
 *
 * Uses tailwind utility classes directly rather than the shadcn Badge
 * variant system — the five statuses have semantically distinct colours
 * (yellow warning, green success, muted, red destructive, orange) that
 * don't map cleanly onto the existing Badge variants (`secondary`,
 * `outline`, `destructive`), so inline classes give a more precise
 * result without adding new variant definitions to the shared component.
 */
export function ReservationStatusBadge({ status }: ReservationStatusBadgeProps) {
  const config: Record<
    ReservationStatusValue,
    { label: string; className: string }
  > = {
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    completed: {
      label: "Completed",
      className: "bg-secondary text-secondary-foreground",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-destructive/10 text-destructive",
    },
    no_show: {
      label: "No Show",
      className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
  };

  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-secondary text-secondary-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}
