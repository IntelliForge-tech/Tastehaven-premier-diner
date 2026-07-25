import { useMemo } from "react";

import type { Floor } from "@/services/floors.service";
import type { RestaurantTable, TableStatus } from "@/services/tables.service";
import type { TableAssignment } from "@/services/table-assignment.service";

export interface FloorAnalytics {
  totalTables: number;
  activeTables: number;
  byStatus: Record<TableStatus, number>;
  totalCapacity: number;
  occupiedCapacity: number;
  occupancyPercent: number;
  byFloor: Array<{
    floor: Floor;
    tableCount: number;
    capacity: number;
    occupied: number;
    occupancyPercent: number;
  }>;
}

export function useFloorAnalytics(
  floors: Floor[],
  tables: RestaurantTable[],
  assignments: TableAssignment[],
): FloorAnalytics {
  return useMemo(() => {
    const activeTables = tables.filter((t) => t.isActive);
    const activeAssignedTableIds = new Set(assignments.map((a) => a.tableId));

    const byStatus: Record<TableStatus, number> = {
      available: 0,
      reserved: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0,
      disabled: 0,
      merge_pending: 0,
    };

    let totalCapacity = 0;
    let occupiedCapacity = 0;

    for (const t of activeTables) {
      byStatus[t.status] = (byStatus[t.status] ?? 0) + 1;
      totalCapacity += t.capacity;
      if (t.status === "occupied") occupiedCapacity += t.capacity;
    }

    const byFloor = floors.map((floor) => {
      const floorTables = activeTables.filter((t) => t.floorId === floor.id);
      const floorCapacity = floorTables.reduce((s, t) => s + t.capacity, 0);
      const floorOccupied = floorTables
        .filter((t) => t.status === "occupied")
        .reduce((s, t) => s + t.capacity, 0);

      return {
        floor,
        tableCount: floorTables.length,
        capacity: floorCapacity,
        occupied: floorOccupied,
        occupancyPercent: floorCapacity > 0 ? Math.round((floorOccupied / floorCapacity) * 100) : 0,
      };
    });

    return {
      totalTables: activeTables.length,
      activeTables: activeTables.filter((t) => t.status === "available").length,
      byStatus,
      totalCapacity,
      occupiedCapacity,
      occupancyPercent: totalCapacity > 0 ? Math.round((occupiedCapacity / totalCapacity) * 100) : 0,
      byFloor,
    };
  }, [floors, tables, assignments]);
}
