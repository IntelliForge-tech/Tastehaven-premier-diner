import {
  Activity,
  CheckCircle2,
  Clock,
  Users,
  Wrench,
  XCircle,
} from "lucide-react";

import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import type { FloorAnalytics } from "@/hooks/useFloorAnalytics";

interface TableAnalyticsCardsProps {
  analytics: FloorAnalytics;
}

export function TableAnalyticsCards({ analytics }: TableAnalyticsCardsProps) {
  const { byStatus, totalTables, totalCapacity, occupiedCapacity, occupancyPercent } = analytics;

  return (
    <div className="space-y-6">
      {/* Top-level stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatsCard label="Total Tables"  value={totalTables}                    icon={Users} />
        <StatsCard label="Available"     value={byStatus.available ?? 0}        icon={CheckCircle2} />
        <StatsCard label="Occupied"      value={byStatus.occupied ?? 0}         icon={Activity} />
        <StatsCard label="Reserved"      value={byStatus.reserved ?? 0}         icon={Clock} />
        <StatsCard label="Cleaning"      value={byStatus.cleaning ?? 0}         icon={XCircle} />
        <StatsCard label="Maintenance"   value={byStatus.maintenance ?? 0}      icon={Wrench} />
      </div>

      {/* Occupancy bar */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-display text-lg font-semibold text-foreground">
            Seat Occupancy
          </h3>
          <span className="text-2xl font-bold text-primary">
            {occupancyPercent}%
          </span>
        </div>
        <div
          className="h-3 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={occupancyPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${occupancyPercent}% occupancy`}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {occupiedCapacity} of {totalCapacity} seats occupied
        </p>
      </div>

      {/* Per-floor breakdown */}
      {analytics.byFloor.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
            By Floor
          </h3>
          <div className="space-y-3">
            {analytics.byFloor.map(({ floor, tableCount, capacity, occupied, occupancyPercent: fp }) => (
              <div key={floor.id}>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">{floor.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {tableCount} tables · {occupied}/{capacity} seats · {fp}%
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={fp}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${floor.name}: ${fp}% occupancy`}
                >
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-500"
                    style={{ width: `${fp}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
