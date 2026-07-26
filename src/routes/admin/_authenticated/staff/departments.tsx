import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Trash2, Building2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useDepartments } from "@/hooks/useDepartments";
import {
  createDepartment, deleteDepartment, updateDepartment,
  type StaffDepartment,
} from "@/services/staff/staff-departments.service";

export const Route = createFileRoute("/admin/_authenticated/staff/departments")({
  component: AdminDepartmentsPage,
  head: () => ({ meta: [{ title: "Departments — Admin — Taste Haven" }] }),
});

const deptSchema = z.object({
  name: z.string().min(1, "Name is required.").max(60),
  description: z.string().max(300).default(""),
  departmentHead: z.string().max(80).default(""),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
type DeptFormValues = z.infer<typeof deptSchema>;

type DialogState = { type: "closed" } | { type: "create" } | { type: "edit"; dept: StaffDepartment };

function AdminDepartmentsPage() {
  const { departments, isLoading, refetch } = useDepartments();
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<StaffDepartment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const r = await deleteDepartment(deleteTarget.id);
    setIsDeleting(false);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success("Department deleted.");
    setDeleteTarget(null); refetch();
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Departments" />
      <PageHeader
        title="Departments"
        description="Organize your restaurant into teams and departments."
        action={
          <Button type="button" variant="gold" onClick={() => setDialog({ type: "create" })} className="inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="size-4" />Add Department
          </Button>
        }
      />

      <SectionContainer>
        {isLoading ? (
          <div className="animate-pulse space-y-2">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-16 rounded-lg bg-muted" />)}</div>
        ) : departments.length === 0 ? (
          <EmptyState icon={Building2} title="No departments yet." description="Create departments to organize your team." action={<Button type="button" variant="gold" onClick={() => setDialog({ type: "create" })} className="inline-flex items-center gap-2 px-5 py-2.5"><Plus className="size-4" />Add Department</Button>} />
        ) : (
          <div className="space-y-2">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{dept.name}</p>
                    {!dept.isActive && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">Disabled</span>}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">#{dept.displayOrder}</span>
                  </div>
                  {dept.description && <p className="truncate text-xs text-muted-foreground">{dept.description}</p>}
                  {dept.departmentHead && <p className="text-xs text-muted-foreground">Head: {dept.departmentHead}</p>}
                </div>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setDialog({ type: "edit", dept })} className="grid size-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-muted"><Pencil className="size-3.5" /></button>
                  <button type="button" onClick={() => setDeleteTarget(dept)} className="grid size-7 place-items-center rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10"><Trash2 className="size-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionContainer>

      <Dialog open={dialog.type !== "closed"} onOpenChange={(o) => { if (!o) setDialog({ type: "closed" }); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{dialog.type === "create" ? "Add Department" : "Edit Department"}</DialogTitle></DialogHeader>
          {dialog.type !== "closed" && (
            <DeptForm
              dept={dialog.type === "edit" ? dialog.dept : undefined}
              nextOrder={departments.length}
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
            <AlertDialogDescription>This will permanently delete the department. Employees assigned to it will be unassigned.</AlertDialogDescription>
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

function DeptForm({ dept, nextOrder, onSuccess, onCancel }: { dept?: StaffDepartment; nextOrder: number; onSuccess: () => void; onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  const form = useForm<DeptFormValues>({
    resolver: zodResolver(deptSchema),
    defaultValues: dept ? { name: dept.name, description: dept.description ?? "", departmentHead: dept.departmentHead ?? "", displayOrder: dept.displayOrder, isActive: dept.isActive } : { name: "", description: "", departmentHead: "", displayOrder: nextOrder, isActive: true },
  });

  async function onSubmit(values: DeptFormValues) {
    setIsSubmitting(true);
    const input = { name: values.name, description: values.description || null, departmentHead: values.departmentHead || null, displayOrder: values.displayOrder, isActive: values.isActive };
    const r = dept ? await updateDepartment(dept.id, input) : await createDepartment(input);
    if (isMountedRef.current) setIsSubmitting(false);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success(dept ? "Department updated." : "Department created.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="Kitchen, Service…" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Optional…" rows={2} disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="departmentHead" render={({ field }) => (<FormItem><FormLabel>Department Head</FormLabel><FormControl><Input placeholder="Manager name…" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="displayOrder" render={({ field }) => (<FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" min={0} disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="isActive" render={({ field }) => (<FormItem className="flex items-center gap-3 space-y-0 rounded-lg border border-border bg-muted/20 p-3"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} /></FormControl><FormLabel className="cursor-pointer text-sm font-medium">Active</FormLabel></FormItem>)} />
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">Cancel</Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2">{isSubmitting && <Loader2 className="size-4 animate-spin" />}{dept ? "Save" : "Create"}</Button>
        </div>
      </form>
    </Form>
  );
}
