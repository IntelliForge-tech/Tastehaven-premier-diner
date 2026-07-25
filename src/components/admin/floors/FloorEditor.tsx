import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { floorSchema, type FloorFormValues } from "@/components/admin/tables/table-schema";
import { Button } from "@/components/common/Button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createFloor, deleteFloor, updateFloor } from "@/services/floors.service";
import type { Floor } from "@/services/floors.service";

interface FloorEditorProps {
  floors: Floor[];
  onRefetch: () => void;
}

type DialogMode = { type: "closed" } | { type: "create" } | { type: "edit"; floor: Floor };

export function FloorEditor({ floors, onRefetch }: FloorEditorProps) {
  const [dialog, setDialog] = useState<DialogMode>({ type: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<Floor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deleteFloor(deleteTarget.id);
    setIsDeleting(false);
    if (!result.success) { toast.error(result.error.message); return; }
    toast.success("Floor deleted.");
    setDeleteTarget(null);
    onRefetch();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Floors</h3>
        <Button
          type="button" variant="gold" onClick={() => setDialog({ type: "create" })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
        >
          <Plus className="size-3.5" />Add Floor
        </Button>
      </div>

      {floors.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">No floors yet. Add your first floor above.</p>
      ) : (
        <div className="space-y-2">
          {floors.map((floor) => (
            <div key={floor.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{floor.name}</p>
                  {!floor.isActive && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Disabled</span>
                  )}
                  {floor.maxCapacity && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Max {floor.maxCapacity}</span>
                  )}
                </div>
                {floor.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{floor.description}</p>
                )}
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDialog({ type: "edit", floor })}
                  aria-label={`Edit ${floor.name}`}
                  className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(floor)}
                  aria-label={`Delete ${floor.name}`}
                  className="grid size-7 place-items-center rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialog.type !== "closed"} onOpenChange={(o) => { if (!o) setDialog({ type: "closed" }); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog.type === "create" ? "Add Floor" : "Edit Floor"}</DialogTitle>
          </DialogHeader>
          {dialog.type !== "closed" && (
            <FloorForm
              floor={dialog.type === "edit" ? dialog.floor : undefined}
              nextOrder={floors.length}
              onSuccess={() => { setDialog({ type: "closed" }); onRefetch(); }}
              onCancel={() => setDialog({ type: "closed" })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o && !isDeleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the floor. Tables on this floor will be orphaned. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Delete Floor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Floor form ───────────────────────────────────────────────────────────────

interface FloorFormProps {
  floor?: Floor;
  nextOrder: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function FloorForm({ floor, nextOrder, onSuccess, onCancel }: FloorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  const form = useForm<FloorFormValues>({
    resolver: zodResolver(floorSchema),
    defaultValues: floor
      ? { name: floor.name, description: floor.description ?? "", displayOrder: floor.displayOrder, maxCapacity: floor.maxCapacity ?? undefined, isActive: floor.isActive }
      : { name: "", description: "", displayOrder: nextOrder, isActive: true },
  });

  async function onSubmit(values: FloorFormValues) {
    setIsSubmitting(true);
    try {
      if (floor) {
        const r = await updateFloor({ id: floor.id, name: values.name, description: values.description || null, displayOrder: values.displayOrder, maxCapacity: values.maxCapacity ?? null, isActive: values.isActive });
        if (!r.success) { toast.error(r.error.message); return; }
        toast.success("Floor updated.");
      } else {
        const r = await createFloor({ name: values.name, description: values.description || null, displayOrder: values.displayOrder, maxCapacity: values.maxCapacity ?? null, isActive: values.isActive });
        if (!r.success) { toast.error(r.error.message); return; }
        toast.success("Floor created.");
      }
      onSuccess();
    } finally {
      if (isMountedRef.current) setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Floor Name <span className="text-destructive">*</span></FormLabel>
            <FormControl><Input placeholder="Ground Floor, VIP Lounge…" disabled={isSubmitting} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="Optional description…" rows={2} disabled={isSubmitting} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="displayOrder" render={({ field }) => (
            <FormItem>
              <FormLabel>Display Order</FormLabel>
              <FormControl><Input type="number" min={0} disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="maxCapacity" render={({ field }) => (
            <FormItem>
              <FormLabel>Max Capacity</FormLabel>
              <FormControl>
                <Input type="number" min={1} placeholder="Optional" disabled={isSubmitting}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? e.target.valueAsNumber : null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="isActive" render={({ field }) => (
          <FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border bg-muted/20 p-3">
            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl>
            <div>
              <FormLabel className="cursor-pointer text-sm font-medium">Active</FormLabel>
              <FormDescription className="text-xs">Inactive floors are hidden from the live view.</FormDescription>
            </div>
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">Cancel</Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {floor ? "Save Changes" : "Create Floor"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
