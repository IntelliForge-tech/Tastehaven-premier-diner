import { Loader2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { TableCapacityBadge } from "@/components/admin/tables/TableCapacityBadge";
import { TableStatusBadge } from "@/components/admin/tables/TableStatusBadge";
import { Button } from "@/components/common/Button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useTableAssignments } from "@/hooks/useTableAssignments";
import type { RestaurantTable } from "@/services/tables.service";
import type { ReservationItem } from "@/services/reservations.service";

interface TableAssignmentDialogProps {
  table: RestaurantTable | null;
  reservations: ReservationItem[];
  onClose: () => void;
  onSuccess: () => void;
  currentUserId: string | null;
}

export function TableAssignmentDialog({
  table,
  reservations,
  onClose,
  onSuccess,
  currentUserId,
}: TableAssignmentDialogProps) {
  const { assign, isSubmitting } = useTableAssignments();
  const [selectedReservationId, setSelectedReservationId] = useState<string>("");

  const eligible = reservations.filter(
    (r) => r.status === "confirmed" || r.status === "pending",
  );

  const selectedReservation = eligible.find((r) => r.id === selectedReservationId);
  const capacityExceeded =
    selectedReservation && table && selectedReservation.partySize > table.capacity;

  async function handleAssign() {
    if (!table || !selectedReservationId) return;

    const result = await assign({
      reservationId: selectedReservationId,
      tableId: table.id,
      assignedBy: currentUserId,
    });

    if (!result.success) {
      toast.error(result.error?.message ?? "Assignment failed.");
      return;
    }

    toast.success(`Table ${table.tableNumber} assigned successfully.`);
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={!!table} onOpenChange={(open) => { if (!open && !isSubmitting) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Table {table?.tableNumber}</DialogTitle>
          <DialogDescription>
            Select a confirmed or pending reservation to assign to this table.
          </DialogDescription>
        </DialogHeader>

        {table && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/20 p-3">
              <TableStatusBadge status={table.status} />
              <TableCapacityBadge capacity={table.capacity} minGuests={table.minGuests} maxGuests={table.maxGuests} />
              {table.tableName && (
                <span className="text-sm text-muted-foreground">{table.tableName}</span>
              )}
            </div>

            {eligible.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No confirmed or pending reservations available to assign.
              </p>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="res-select">Reservation</label>
                <Select value={selectedReservationId} onValueChange={setSelectedReservationId}>
                  <SelectTrigger id="res-select">
                    <SelectValue placeholder="Select a reservation…" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligible.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.customerName} · {r.partySize} guests · {r.reservationDate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {capacityExceeded && (
                  <div className="flex items-start gap-2 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-800 dark:border-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                    <Users className="mt-0.5 size-4 shrink-0" />
                    <span>
                      Warning: This reservation has {selectedReservation.partySize} guests but the table capacity is only {table.capacity}. You can still assign, but it exceeds capacity.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            type="button"
            variant="gold"
            disabled={isSubmitting || !selectedReservationId}
            onClick={handleAssign}
            className="inline-flex items-center gap-2 px-5 py-2"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Assign Table
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
