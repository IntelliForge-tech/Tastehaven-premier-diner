import { Loader2, Merge } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createMergeGroup } from "@/services/table-merge.service";
import type { RestaurantTable } from "@/services/tables.service";

interface TableMergeDialogProps {
  open: boolean;
  tables: RestaurantTable[];
  selectedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function TableMergeDialog({
  open,
  tables,
  selectedIds,
  onClose,
  onSuccess,
}: TableMergeDialogProps) {
  const [groupName, setGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTables = tables.filter((t) => selectedIds.includes(t.id));
  const combinedCapacity = selectedTables.reduce((s, t) => s + t.capacity, 0);

  async function handleMerge() {
    if (selectedIds.length < 2) {
      toast.error("Select at least 2 tables to merge.");
      return;
    }
    setIsSubmitting(true);
    const result = await createMergeGroup({
      groupName: groupName.trim() || `Merged (${selectedTables.map((t) => t.tableNumber).join("+")})`,
      tableIds: selectedIds,
    });
    setIsSubmitting(false);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Tables merged successfully.");
    setGroupName("");
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !isSubmitting) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Merge className="size-5" />
            Merge Tables
          </DialogTitle>
          <DialogDescription>
            Combine {selectedIds.length} tables into a single group with a combined capacity of {combinedCapacity} guests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Selected Tables</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedTables.map((t) => (
                <span key={t.id} className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium">
                  Table {t.tableNumber} ({t.capacity} seats)
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Combined capacity: <strong>{combinedCapacity} guests</strong>
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="group-name">Group Name (optional)</label>
            <Input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={`Merged (${selectedTables.map((t) => t.tableNumber).join("+")})`}
              maxLength={80}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onClose} className="px-4 py-2">
            Cancel
          </Button>
          <Button
            type="button"
            variant="gold"
            disabled={isSubmitting || selectedIds.length < 2}
            onClick={handleMerge}
            className="inline-flex items-center gap-2 px-5 py-2"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Merge Tables
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
