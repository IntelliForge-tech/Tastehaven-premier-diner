import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Clock, FileText, Loader2, Plus, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { LeaveApprovalDialog } from "@/components/admin/staff/LeaveApprovalDialog";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { useStaff } from "@/hooks/useStaff";
import { createLeaveRequest, type LeaveRequest, type LeaveStatus } from "@/services/staff/staff-leave.service";

export const Route = createFileRoute("/admin/_authenticated/staff/leave")({
  component: AdminLeavePage,
  head: () => ({ meta: [{ title: "Leave Requests — Admin — Taste Haven" }] }),
});

const LEAVE_TYPES = ["sick","casual","paid","emergency","maternity","paternity","vacation","unpaid"] as const;
const LEAVE_TYPE_LABELS: Record<string, string> = { sick:"Sick",casual:"Casual",paid:"Paid",emergency:"Emergency",maternity:"Maternity",paternity:"Paternity",vacation:"Vacation",unpaid:"Unpaid" };

const leaveSchema = z.object({
  staffMemberId: z.string().min(1, "Please select an employee."),
  leaveType: z.enum(LEAVE_TYPES),
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string().min(1, "End date is required."),
  totalDays: z.number().int().min(1).default(1),
  reason: z.string().max(500).default(""),
});
type LeaveFormValues = z.infer<typeof leaveSchema>;

type ApprovalState = { request: LeaveRequest; action: "approve" | "reject" } | null;

function AdminLeavePage() {
  const { requests, isLoading, refetch } = useLeaveRequests();
  const { staff } = useStaff();
  const [addOpen, setAddOpen] = useState(false);
  const [approval, setApproval] = useState<ApprovalState>(null);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");

  const filtered = statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter);

  const STATUS_TABS: Array<{ value: LeaveStatus | "all"; label: string }> = [
    { value: "all", label: `All (${requests.length})` },
    { value: "pending", label: `Pending (${requests.filter((r) => r.status === "pending").length})` },
    { value: "approved", label: `Approved (${requests.filter((r) => r.status === "approved").length})` },
    { value: "rejected", label: `Rejected (${requests.filter((r) => r.status === "rejected").length})` },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Leave Requests" />
      <PageHeader
        title="Leave Requests"
        description="Review and approve staff leave requests."
        action={
          <Button type="button" variant="gold" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="size-4" />New Request
          </Button>
        }
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${statusFilter === tab.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <SectionContainer>
        {isLoading ? (
          <div className="animate-pulse space-y-2">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-20 rounded-lg bg-muted" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={FileText} title="No leave requests." description="Leave requests submitted by staff will appear here." />
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => (
              <div key={req.id} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${req.status === "pending" ? "border-yellow-300/60 bg-yellow-50/30 dark:border-yellow-700/40 dark:bg-yellow-900/10" : "border-border bg-card"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{req.staffName ?? "Unknown"}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{LEAVE_TYPE_LABELS[req.leaveType] ?? req.leaveType}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${req.status === "approved" ? "bg-emerald-100 text-emerald-800" : req.status === "rejected" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>{req.status}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{req.startDate} – {req.endDate} · {req.totalDays} day{req.totalDays !== 1 ? "s" : ""}</p>
                  {req.reason && <p className="mt-0.5 text-xs text-muted-foreground">{req.reason}</p>}
                </div>
                {req.status === "pending" && (
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => setApproval({ request: req, action: "approve" })} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />Approve
                    </button>
                    <button type="button" onClick={() => setApproval({ request: req, action: "reject" })} className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
                      <XCircle className="size-3.5" />Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionContainer>

      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) setAddOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Leave Request</DialogTitle></DialogHeader>
          <LeaveForm staff={staff} onSuccess={() => { setAddOpen(false); refetch(); }} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <LeaveApprovalDialog
        request={approval?.request ?? null}
        action={approval?.action ?? null}
        onClose={() => setApproval(null)}
        onSuccess={refetch}
      />
    </div>
  );
}

function LeaveForm({ staff, onSuccess, onCancel }: { staff: ReturnType<typeof useStaff>["staff"]; onSuccess: () => void; onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: { leaveType: "casual", startDate: new Date().toISOString().slice(0, 10), endDate: new Date().toISOString().slice(0, 10), totalDays: 1, reason: "" },
  });

  async function onSubmit(values: LeaveFormValues) {
    setIsSubmitting(true);
    const r = await createLeaveRequest({ staffMemberId: values.staffMemberId, leaveType: values.leaveType, startDate: values.startDate, endDate: values.endDate, totalDays: values.totalDays, reason: values.reason || null });
    if (isMountedRef.current) setIsSubmitting(false);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success("Leave request submitted.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField control={form.control} name="staffMemberId" render={({ field }) => (<FormItem><FormLabel>Employee *</FormLabel><Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue placeholder="Select employee…" /></SelectTrigger></FormControl><SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="leaveType" render={({ field }) => (<FormItem><FormLabel>Leave Type *</FormLabel><Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{LEAVE_TYPES.map((t) => <SelectItem key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="startDate" render={({ field }) => (<FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="endDate" render={({ field }) => (<FormItem><FormLabel>End Date *</FormLabel><FormControl><Input type="date" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="totalDays" render={({ field }) => (<FormItem><FormLabel>Total Days</FormLabel><FormControl><Input type="number" min={1} disabled={isSubmitting} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="reason" render={({ field }) => (<FormItem><FormLabel>Reason</FormLabel><FormControl><Textarea placeholder="Reason for leave…" rows={2} disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">Cancel</Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2">{isSubmitting && <Loader2 className="size-4 animate-spin" />}Submit</Button>
        </div>
      </form>
    </Form>
  );
}
