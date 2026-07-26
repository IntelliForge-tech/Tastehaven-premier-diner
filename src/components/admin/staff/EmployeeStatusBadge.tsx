import { cn } from "@/lib/utils";
import type { EmploymentStatus } from "@/services/staff/staff.service";

const STATUS_CONFIG: Record<EmploymentStatus, { label: string; className: string }> = {
  active:      { label: "Active",      className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  inactive:    { label: "Inactive",    className: "bg-secondary text-secondary-foreground" },
  on_leave:    { label: "On Leave",    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  suspended:   { label: "Suspended",   className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  resigned:    { label: "Resigned",    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  terminated:  { label: "Terminated",  className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  probation:   { label: "Probation",   className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  retired:     { label: "Retired",     className: "bg-muted text-muted-foreground" },
};

interface EmployeeStatusBadgeProps {
  status: EmploymentStatus;
  className?: string;
}

export function EmployeeStatusBadge({ status, className }: EmployeeStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.inactive;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", cfg.className, className)}>
      {cfg.label}
    </span>
  );
}

export { STATUS_CONFIG as EMPLOYMENT_STATUS_CONFIG };
