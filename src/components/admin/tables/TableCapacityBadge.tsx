import { Users } from "lucide-react";

import { cn } from "@/lib/utils";

interface TableCapacityBadgeProps {
  capacity: number;
  minGuests?: number | null;
  maxGuests?: number | null;
  className?: string;
}

export function TableCapacityBadge({ capacity, minGuests, maxGuests, className }: TableCapacityBadgeProps) {
  const label =
    minGuests && maxGuests
      ? `${minGuests}–${maxGuests} guests`
      : `${capacity} seats`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Users className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}
