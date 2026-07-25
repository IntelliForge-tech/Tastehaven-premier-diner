import { cn } from "@/lib/utils";
import type { TableStatus } from "@/services/tables.service";

interface TableStatusBadgeProps {
  status: TableStatus;
  className?: string;
}

const STATUS_CONFIG: Record<TableStatus, { label: string; className: string; dot: string }> = {
  available:     { label: "Available",     className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400", dot: "bg-emerald-500" },
  reserved:      { label: "Reserved",      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",           dot: "bg-blue-500" },
  occupied:      { label: "Occupied",      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",               dot: "bg-red-500" },
  cleaning:      { label: "Cleaning",      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",   dot: "bg-yellow-500" },
  maintenance:   { label: "Maintenance",   className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",   dot: "bg-orange-500" },
  disabled:      { label: "Disabled",      className: "bg-secondary text-secondary-foreground",                                     dot: "bg-muted-foreground" },
  merge_pending: { label: "Merge Pending", className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",   dot: "bg-purple-500" },
};

export function TableStatusBadge({ status, className }: TableStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disabled;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dot)} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export { STATUS_CONFIG };
