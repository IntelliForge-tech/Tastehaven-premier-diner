import { RefreshCw } from "lucide-react";

import { FloorCanvas } from "@/components/admin/floors/FloorCanvas";
import { FloorSelector } from "@/components/admin/floors/FloorSelector";
import { TableStatusBadge } from "@/components/admin/tables/TableStatusBadge";
import { useFloors } from "@/hooks/useFloors";
import { useTables } from "@/hooks/useTables";
import type { RestaurantTable } from "@/services/tables.service";

interface LiveFloorViewProps {
  onTableSelect: (table: RestaurantTable) => void;
  selectedFloorId: string | null;
  onFloorChange: (id: string | null) => void;
}

const STATUS_LEGEND: Array<{ status: RestaurantTable["status"]; label: string }> = [
  { status: "available", label: "Available" },
  { status: "reserved", label: "Reserved" },
  { status: "occupied", label: "Occupied" },
  { status: "cleaning", label: "Cleaning" },
  { status: "maintenance", label: "Maintenance" },
];

export function LiveFloorView({ onTableSelect, selectedFloorId, onFloorChange }: LiveFloorViewProps) {
  const { floors, refetch: refetchFloors } = useFloors();
  const { tables, isLoading, refetch: refetchTables } = useTables(selectedFloorId ?? undefined);

  function handleRefresh() {
    refetchFloors();
    refetchTables();
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FloorSelector floors={floors} selectedId={selectedFloorId} onSelect={onFloorChange} />
        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Refresh floor view"
        >
          <RefreshCw className="size-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {STATUS_LEGEND.map(({ status, label }) => (
          <TableStatusBadge key={status} status={status} />
        ))}
      </div>

      {/* Occupancy summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STATUS_LEGEND.map(({ status, label }) => {
          const count = tables.filter((t) => t.isActive && t.status === status).length;
          return (
            <div key={status} className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="font-display text-2xl font-semibold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          );
        })}
      </div>

      {/* Canvas */}
      {isLoading ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Loading floor plan…
        </div>
      ) : tables.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          No tables on this floor yet.
        </div>
      ) : (
        <FloorCanvas
          tables={tables}
          onSelect={onTableSelect}
          onRefetch={refetchTables}
          readOnly
        />
      )}
    </div>
  );
}
