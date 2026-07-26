import { cn } from "@/lib/utils";
import type { CustomerStatus } from "@/services/customers.service";

interface CustomerStatusBadgeProps {
  status: CustomerStatus;
}

const STATUS_CONFIG: Record<CustomerStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground border-border" },
  blacklisted: { label: "Blacklisted", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function CustomerStatusBadge({ status }: CustomerStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.active;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}
