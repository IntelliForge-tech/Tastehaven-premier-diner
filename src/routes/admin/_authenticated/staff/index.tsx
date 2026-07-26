import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Plus, Users } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { EmployeeStatusBadge } from "@/components/admin/staff/EmployeeStatusBadge";
import { StaffFilters, StaffSearch } from "@/components/admin/staff/StaffSearch";
import { StaffForm } from "@/components/admin/staff/StaffForm";
import { StaffTable } from "@/components/admin/staff/StaffTable";
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
import { useStaff } from "@/hooks/useStaff";
import { useDepartments } from "@/hooks/useDepartments";
import { useShifts } from "@/hooks/useShifts";
import { deleteStaffMember, updateEmploymentStatus, type StaffMember, type EmploymentStatus } from "@/services/staff/staff.service";
import type { StaffFiltersState } from "@/components/admin/staff/StaffSearch";

export const Route = createFileRoute("/admin/_authenticated/staff/")({
  component: AdminStaffPage,
  head: () => ({ meta: [{ title: "Staff — Admin — Taste Haven" }] }),
});

type DialogState = { type: "closed" } | { type: "create" } | { type: "edit"; member: StaffMember };

function AdminStaffPage() {
  const { staff, isLoading, error, refetch } = useStaff();
  const { departments } = useDepartments();
  const { shifts } = useShifts();

  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<StaffFiltersState>({ status: "", departmentId: "", shiftId: "", sortBy: "newest" });

  const filtered = useMemo(() => {
    let result = [...staff];
    const q = search.toLowerCase();
    if (q) result = result.filter((m) =>
      m.firstName.toLowerCase().includes(q) || m.lastName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) || m.employeeId.toLowerCase().includes(q) ||
      (m.phone ?? "").toLowerCase().includes(q)
    );
    if (filters.status) result = result.filter((m) => m.employmentStatus === filters.status);
    if (filters.departmentId) result = result.filter((m) => m.departmentId === filters.departmentId);
    if (filters.shiftId) result = result.filter((m) => m.shiftId === filters.shiftId);

    switch (filters.sortBy) {
      case "oldest": result.sort((a, b) => a.createdAt.localeCompare(b.createdAt)); break;
      case "name_asc": result.sort((a, b) => a.firstName.localeCompare(b.firstName)); break;
      case "name_desc": result.sort((a, b) => b.firstName.localeCompare(a.firstName)); break;
      case "joining_asc": result.sort((a, b) => a.joiningDate.localeCompare(b.joiningDate)); break;
      case "joining_desc": result.sort((a, b) => b.joiningDate.localeCompare(a.joiningDate)); break;
      default: result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return result;
  }, [staff, search, filters]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const r = await deleteStaffMember(deleteTarget.id);
    setIsDeleting(false);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success("Employee deleted.");
    setDeleteTarget(null); refetch();
  }

  async function handleStatusChange(id: string, status: EmploymentStatus) {
    const r = await updateEmploymentStatus(id, status);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success("Status updated.");
    refetch();
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="All Employees" />
      <PageHeader
        title="All Employees"
        description={`${staff.length} employee${staff.length !== 1 ? "s" : ""} in your team.`}
        action={
          <Button type="button" variant="gold" onClick={() => setDialog({ type: "create" })} className="inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="size-4" />Add Employee
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <StaffSearch value={search} onChange={setSearch} />
        <StaffFilters departments={departments} shifts={shifts} filters={filters} onChange={setFilters} />
      </div>

      <SectionContainer>
        {isLoading ? (
          <StaffTableSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </div>
            <p className="text-sm font-medium">Couldn&apos;t load staff</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetch} className="mt-1 px-4 py-2">Try again</Button>
          </div>
        ) : filtered.length === 0 ? (
          staff.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No employees yet."
              description="Add your first team member to get started."
              action={<Button type="button" variant="gold" onClick={() => setDialog({ type: "create" })} className="inline-flex items-center gap-2 px-5 py-2.5"><Plus className="size-4" />Add Employee</Button>}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No employees match your filters.</p>
          )
        ) : (
          <StaffTable
            staff={filtered}
            onEdit={(m) => setDialog({ type: "edit", member: m })}
            onDelete={(m) => setDeleteTarget(m)}
            onStatusChange={handleStatusChange}
          />
        )}
      </SectionContainer>

      <Dialog open={dialog.type !== "closed"} onOpenChange={(o) => { if (!o) setDialog({ type: "closed" }); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialog.type === "create" ? "Add Employee" : `Edit ${dialog.type === "edit" ? dialog.member.firstName : ""}`}</DialogTitle>
          </DialogHeader>
          {dialog.type !== "closed" && (
            <StaffForm
              member={dialog.type === "edit" ? dialog.member : undefined}
              departments={departments}
              shifts={shifts}
              allStaff={staff}
              onSuccess={() => { setDialog({ type: "closed" }); refetch(); }}
              onCancel={() => setDialog({ type: "closed" })}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o && !isDeleting) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.firstName} {deleteTarget?.lastName}?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the employee and all their records. This cannot be undone.</AlertDialogDescription>
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

function StaffTableSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border overflow-hidden">
      <div className="h-10 bg-muted/40" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-t border-border px-4 py-3">
          <div className="size-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-1">
            <div className="h-3.5 w-40 rounded bg-muted" />
            <div className="h-3 w-28 rounded bg-muted" />
          </div>
          <div className="h-5 w-16 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}
