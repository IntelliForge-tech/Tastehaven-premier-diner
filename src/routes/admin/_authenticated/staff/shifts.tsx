import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Trash2, Clock } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useShifts } from "@/hooks/useShifts";
import {
  createShift, deleteShift, updateShift, type StaffShift,
} from "@/services/staff/staff-shifts.service";

export const Route = createFileRoute("/admin/_authenticated/staff/shifts")({
  component: AdminShiftsPage,
  head: () => ({ meta: [{ title: "Shifts — Admin — Taste Haven" }] }),
});

const shiftSchema = z.object({
  name: z.string().min(1, "Shift name is required.").max(60),
  startTime: z.string().min(1, "Start time is required."),
  endTime: z.string().min(1, "End time is required."),
  breakMinutes: z.number().int().min(0).default(30),
  workingHours: z.number().min(0).default(8),
  isActive: z.boolean().default(true),
});
type ShiftFormValues = z.infer<typeof shiftSchema>;

type DialogState = { type: "closed" } | { type: "create" } | { type: "edit"; shift: StaffShift };

function AdminShiftsPage() {
  const { shifts, isLoading, refetch } = useShifts();
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<StaffShift | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const r = await deleteShift(deleteTarget.id);
    setIsDeleting(false);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success("Shift deleted.");
    setDeleteTarget(null); refetch();
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Shifts" />
      <PageHeader
        title="Shift Management"
        description="Define working shifts for your team."
        action={
          <Button type="button" variant="gold" onClick={() => setDialog({ type: "create" })} className="inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="size-4" />Add Shift
          </Button>
        }
      />

      <SectionContainer>
        {isLoading ? (
          <div className="animate-pulse space-y-2">{Array.from({ length: 3 }, (_, i) => <div key={i} className="h-16 rounded-lg bg-muted" />)}</div>
        ) : shifts.length === 0 ? (
          <EmptyState icon={Clock} title="No shifts yet." description="Create shifts like Morning, Evening, or Night." action={<Button type="button" variant="gold" onClick={() => setDialog({ type: "create" })} className="inline-flex items-center gap-2 px-5 py-2.5"><Plus className="size-4" />Add Shift</Button>} />
        ) : (
          <div className="space-y-2">
            {shifts.map((shift) => (
              <div key={shift.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Clock className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{shift.name}</p>
                    {!shift.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Disabled</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {shift.startTime} – {shift.endTime} · {shift.workingHours}h working · {shift.breakMinutes}min break
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setDialog({ type: "edit", shift })} className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted"><Pencil className="size-3.5" /></button>
                  <button type="button" onClick={() => setDeleteTarget(shift)} className="grid size-7 place-items-center rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="size-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionContainer>

      <Dialog open={dialog.type !== "closed"} onOpenChange={(o) => { if (!o) setDialog({ type: "closed" }); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{dialog.type === "create" ? "Add Shift" : "Edit Shift"}</DialogTitle></DialogHeader>
          {dialog.type !== "closed" && (
            <ShiftForm
              shift={dialog.type === "edit" ? dialog.shift : undefined}
              onSuccess={() => { setDialog({ type: "closed" }); refetch(); }}
              onCancel={() => setDialog({ type: "closed" })}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o && !isDeleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the shift.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={isDeleting} onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ShiftForm({ shift, onSuccess, onCancel }: { shift?: StaffShift; onSuccess: () => void; onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: shift ? { name: shift.name, startTime: shift.startTime, endTime: shift.endTime, breakMinutes: shift.breakMinutes, workingHours: shift.workingHours, isActive: shift.isActive } : { name: "", startTime: "09:00", endTime: "17:00", breakMinutes: 30, workingHours: 8, isActive: true },
  });

  async function onSubmit(values: ShiftFormValues) {
    setIsSubmitting(true);
    const r = shift ? await updateShift(shift.id, values) : await createShift(values);
    if (isMountedRef.current) setIsSubmitting(false);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success(shift ? "Shift updated." : "Shift created.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Shift Name *</FormLabel><FormControl><Input placeholder="Morning Shift, Night Shift…" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="startTime" render={({ field }) => (<FormItem><FormLabel>Start Time *</FormLabel><FormControl><Input type="time" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="endTime" render={({ field }) => (<FormItem><FormLabel>End Time *</FormLabel><FormControl><Input type="time" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="breakMinutes" render={({ field }) => (<FormItem><FormLabel>Break (min)</FormLabel><FormControl><Input type="number" min={0} disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="workingHours" render={({ field }) => (<FormItem><FormLabel>Working Hours</FormLabel><FormControl><Input type="number" min={0} step={0.5} disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border bg-muted/20 p-3"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl><FormLabel className="cursor-pointer text-sm font-medium">Active</FormLabel></FormItem>)} />
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">Cancel</Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2">{isSubmitting && <Loader2 className="size-4 animate-spin" />}{shift ? "Save" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
}
