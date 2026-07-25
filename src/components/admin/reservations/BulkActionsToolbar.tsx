import { CheckSquare, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { STATUS_LABELS, type ReservationStatusValue } from "@/services/reservations.service";
import { bulkDeleteReservations, bulkUpdateStatus } from "@/services/reservations.service";

const BULK_STATUS_ACTIONS: { status: ReservationStatusValue; label: string }[] = [
  { status: "confirmed", label: "Confirm All" },
  { status: "cancelled", label: "Cancel All" },
  { status: "no_show", label: "Mark No Show" },
  { status: "completed", label: "Complete All" },
];

interface BulkActionsToolbarProps {
  selectedIds: string[];
  adminUserId: string;
  onClear: () => void;
  onRefetch: () => void;
}

export function BulkActionsToolbar({
  selectedIds,
  adminUserId,
  onClear,
  onRefetch,
}: BulkActionsToolbarProps) {
  const [isWorking, setIsWorking] = useState(false);

  if (selectedIds.length === 0) return null;

  async function handleBulkStatus(newStatus: ReservationStatusValue) {
    if (
      !window.confirm(
        `Set ${selectedIds.length} reservation(s) to "${STATUS_LABELS[newStatus]}"?`,
      )
    )
      return;
    setIsWorking(true);
    try {
      const result = await bulkUpdateStatus(selectedIds, newStatus, adminUserId);
      if (!result.success) {
        toast.error(result.error.message);
      } else {
        toast.success(`${selectedIds.length} reservation(s) updated.`);
        onClear();
        onRefetch();
      }
    } finally {
      setIsWorking(false);
    }
  }

  async function handleBulkDelete() {
    if (
      !window.confirm(
        `Permanently delete ${selectedIds.length} reservation(s)? This cannot be undone.`,
      )
    )
      return;
    setIsWorking(true);
    try {
      const result = await bulkDeleteReservations(selectedIds);
      if (!result.success) {
        toast.error(result.error.message);
      } else {
        toast.success(`${selectedIds.length} reservation(s) deleted.`);
        onClear();
        onRefetch();
      }
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
      <CheckSquare className="size-4 text-primary" />
      <span className="text-sm font-medium">
        {selectedIds.length} selected
      </span>

      <div className="mx-2 h-4 w-px bg-border" />

      {BULK_STATUS_ACTIONS.map((a) => (
        <Button
          key={a.status}
          type="button"
          variant="outline-gold"
          disabled={isWorking}
          onClick={() => handleBulkStatus(a.status)}
          className="h-7 px-3 text-xs"
        >
          {isWorking ? <Loader2 className="size-3 animate-spin" /> : null}
          {a.label}
        </Button>
      ))}

      <Button
        type="button"
        variant="outline"
        disabled={isWorking}
        onClick={handleBulkDelete}
        className="h-7 gap-1.5 px-3 text-xs text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-3" />
        Delete
      </Button>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto grid size-6 place-items-center rounded-md text-muted-foreground hover:text-foreground"
        aria-label="Clear selection"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
