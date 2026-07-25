import { Users } from "lucide-react";

import { TableStatusBadge } from "@/components/admin/tables/TableStatusBadge";
import type { FloorAnalytics } from "@/hooks/useFloorAnalytics";
import type { RestaurantTable } from "@/services/tables.service";

interface OccupancyDashboardProps {
  tables: RestaurantTable[];
  analytics: FloorAnalytics;
}

export function OccupancyDashboard({ tables, analytics }: OccupancyDashboardProps) {
  const occupiedTables = tables.filter((t) => t.isActive && t.status === "occupied");
  const reservedTables = tables.filter((t) => t.isActive && t.status === "reserved");
  const availableTables = tables.filter((t) => t.isActive && t.status === "available");

  return (
    <div className="space-y-6">
      {/* Summary ring-style cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <OccupancyRingCard
          label="Occupied"
          count={occupiedTables.length}
          total={analytics.totalTables}
          colorClass="text-red-500"
          bgClass="bg-red-50 dark:bg-red-900/20"
          ringClass="stroke-red-500"
        />
        <OccupancyRingCard
          label="Reserved"
          count={reservedTables.length}
          total={analytics.totalTables}
          colorClass="text-blue-500"
          bgClass="bg-blue-50 dark:bg-blue-900/20"
          ringClass="stroke-blue-500"
        />
        <OccupancyRingCard
          label="Available"
          count={availableTables.length}
          total={analytics.totalTables}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-50 dark:bg-emerald-900/20"
          ringClass="stroke-emerald-500"
        />
      </div>

      {/* Table-by-table breakdown */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-3">
          <h3 className="font-display text-base font-semibold text-foreground">
            Live Table Status
          </h3>
        </div>
        <div className="divide-y divide-border">
          {tables
            .filter((t) => t.isActive)
            .map((table) => (
              <div
                key={table.id}
                className="flex items-center gap-4 px-5 py-3"
              >
                <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  {table.tableNumber}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {table.tableName ?? `Table ${table.tableNumber}`}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3" aria-hidden="true" />
                    {table.capacity} seats
                  </p>
                </div>
                <TableStatusBadge status={table.status} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Ring card ────────────────────────────────────────────────────────────────

interface OccupancyRingCardProps {
  label: string;
  count: number;
  total: number;
  colorClass: string;
  bgClass: string;
  ringClass: string;
}

function OccupancyRingCard({
  label,
  count,
  total,
  colorClass,
  bgClass,
  ringClass,
}: OccupancyRingCardProps) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const RADIUS = 36;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  return (
    <div className={`flex items-center gap-4 rounded-xl border border-border p-5 ${bgClass}`}>
      <div className="relative size-20 shrink-0">
        <svg
          className="-rotate-90"
          width={80}
          height={80}
          viewBox="0 0 80 80"
          aria-hidden="true"
        >
          <circle
            cx={40}
            cy={40}
            r={RADIUS}
            fill="none"
            className="stroke-muted"
            strokeWidth={8}
          />
          <circle
            cx={40}
            cy={40}
            r={RADIUS}
            fill="none"
            className={ringClass}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-lg font-bold ${colorClass}`}>{pct}%</span>
        </div>
      </div>
      <div>
        <p className={`text-3xl font-bold ${colorClass}`}>{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">of {total} tables</p>
      </div>
    </div>
  );
}
