import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { TableCapacityBadge } from "@/components/admin/tables/TableCapacityBadge";
import { TableStatusBadge } from "@/components/admin/tables/TableStatusBadge";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateTableStatus } from "@/services/tables.service";
import type { RestaurantTable, TableStatus } from "@/services/tables.service";
import type { Floor } from "@/services/floors.service";

const SHAPE_ICONS: Record<RestaurantTable["shape"], string> = {
  square: "⬜",
  rectangle: "▬",
  circle: "⚪",
  oval: "⬭",
  booth: "🪑",
  custom: "✦",
};

interface TableCardProps {
  table: RestaurantTable;
  floor?: Floor;
  onEdit: (table: RestaurantTable) => void;
  onDelete: (table: RestaurantTable) => void;
  onStatusChange: () => void;
}

const STATUS_ACTIONS: Array<{ status: TableStatus; label: string }> = [
  { status: "available", label: "Mark Available" },
  { status: "reserved", label: "Mark Reserved" },
  { status: "occupied", label: "Mark Occupied" },
  { status: "cleaning", label: "Mark Cleaning" },
  { status: "maintenance", label: "Mark Maintenance" },
];

export function TableCard({ table, floor, onEdit, onDelete, onStatusChange }: TableCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange(status: TableStatus) {
    if (status === table.status || isUpdating) return;
    setIsUpdating(true);
    const result = await updateTableStatus(table.id, status);
    setIsUpdating(false);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    onStatusChange();
  }

  return (
    <div className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{SHAPE_ICONS[table.shape]}</span>
          <div>
            <p className="font-medium text-foreground">
              Table {table.tableNumber}
              {table.tableName && <span className="ml-1.5 text-muted-foreground">· {table.tableName}</span>}
            </p>
            {floor && (
              <p className="text-xs text-muted-foreground">{floor.name}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted focus:opacity-100"
              aria-label={`Actions for table ${table.tableNumber}`}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(table)}>
              <Pencil className="mr-2 size-3.5" />
              Edit Table
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {STATUS_ACTIONS.filter((a) => a.status !== table.status).map((a) => (
              <DropdownMenuItem
                key={a.status}
                onClick={() => handleStatusChange(a.status)}
                disabled={isUpdating}
              >
                {a.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(table)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-3.5" />
              Delete Table
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status + capacity */}
      <div className="flex flex-wrap items-center gap-2">
        <TableStatusBadge status={table.status} />
        <TableCapacityBadge capacity={table.capacity} minGuests={table.minGuests} maxGuests={table.maxGuests} />
      </div>

      {/* Notes */}
      {table.notes && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{table.notes}</p>
      )}
    </div>
  );
}
