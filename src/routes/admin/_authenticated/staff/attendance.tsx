import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus } from "lucide-react";
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
import { useAttendance } from "@/hooks/useAttendance";
import { useStaff } from "@/hooks/useStaff";
import { upsertAttendance, type AttendanceStatus } from "@/services/staff/staff-attendance.service";
import { CalendarCheck } from "lucide-react";

export const Route = createFileRoute("/admin/_authenticated/staff/attendance")({
  component: AdminAttendancePage,
  head: () => ({ meta: [{ title: "Attendance — Admin — Taste Haven" }] }),
});

const ATTENDANCE_STATUSES: AttendanceStatus[] = ["present","absent","late","half_day","overtime","on_leave"];
const STATUS_LABELS: Record<AttendanceStatus, string> = { present:"Present", absent:"Absent", late:"Late", half_day:"Half Day", overtime:"Overtime", on_leave:"On Leave" };
const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 text-emerald-800", absent: "bg-red-100 text-red-800",
  late: "bg-yellow-100 text-yellow-800", half_day: "bg-blue-100 text-blue-800",
  overtime: "bg-purple-100 text-purple-800", on_leave: "bg-muted text-muted-foreground",
};

const attendanceSchema = z.object({
  staffMemberId: z.string().min(1, "Select an employee."),
  attendanceDate: z.string().min(1),
  checkIn: z.string().default(""),
  checkOut: z.string().default(""),
  workingHours: z.number().nullable().optional(),
  status: z.enum(["present","absent","late","half_day","overtime","on_leave"] as const),
  lateMinutes: z.number().int().min(0).default(0),
  overtimeMinutes: z.number().int().min(0).default(0),
  notes: z.string().max(300).default(""),
});
type AttendanceFormValues = z.infer<typeof attendanceSchema>;

function AdminAttendancePage() {
  const { attendance, isLoading, refetch } = useAttendance();
  const { staff } = useStaff();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Attendance" />
      <PageHeader
        title="Attendance"
        description="Track daily staff check-ins and absences."
        action={
          <Button type="button" variant="gold" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="size-4" />Record Attendance
          </Button>
        }
      />

      <SectionContainer>
        {isLoading ? (
          <div className="animate-pulse space-y-2">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-14 rounded-lg bg-muted" />)}</div>
        ) : attendance.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance records." description="Start tracking daily attendance by clicking Record Attendance." action={<Button type="button" variant="gold" onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5"><Plus className="size-4" />Record Attendance</Button>} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Check In</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Check Out</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attendance.map((a) => {
                  const member = staff.find((s) => s.id === a.staffMemberId);
                  return (
                    <tr key={a.id} className="bg-card hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium text-foreground">{member ? `${member.firstName} ${member.lastName}` : a.staffMemberId.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.attendanceDate}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.checkIn ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.checkOut ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status]}`}>{STATUS_LABELS[a.status]}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{a.workingHours != null ? `${a.workingHours}h` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionContainer>

      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) setAddOpen(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Attendance</DialogTitle></DialogHeader>
          <AttendanceForm staff={staff} onSuccess={() => { setAddOpen(false); refetch(); }} onCancel={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AttendanceForm({ staff, onSuccess, onCancel }: { staff: ReturnType<typeof useStaff>["staff"]; onSuccess: () => void; onCancel: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMountedRef = useRef(true);

  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: { attendanceDate: new Date().toISOString().slice(0, 10), status: "present", checkIn: "09:00", checkOut: "17:00", lateMinutes: 0, overtimeMinutes: 0, notes: "" },
  });

  async function onSubmit(values: AttendanceFormValues) {
    setIsSubmitting(true);
    const r = await upsertAttendance({ staffMemberId: values.staffMemberId, attendanceDate: values.attendanceDate, checkIn: values.checkIn || null, checkOut: values.checkOut || null, workingHours: values.workingHours ?? null, status: values.status, lateMinutes: values.lateMinutes, overtimeMinutes: values.overtimeMinutes, notes: values.notes || null });
    if (isMountedRef.current) setIsSubmitting(false);
    if (!r.success) { toast.error(r.error.message); return; }
    toast.success("Attendance recorded.");
    onSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField control={form.control} name="staffMemberId" render={({ field }) => (<FormItem><FormLabel>Employee *</FormLabel><Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger></FormControl><SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="attendanceDate" render={({ field }) => (<FormItem><FormLabel>Date *</FormLabel><FormControl><Input type="date" disabled={isSubmitting} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="status" render={({ field }) => (<FormItem><FormLabel>Status *</FormLabel><Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{ATTENDANCE_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="checkIn" render={({ field }) => (<FormItem><FormLabel>Check In</FormLabel><FormControl><Input type="time" disabled={isSubmitting} {...field} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="checkOut" render={({ field }) => (<FormItem><FormLabel>Check Out</FormLabel><FormControl><Input type="time" disabled={isSubmitting} {...field} /></FormControl></FormItem>)} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (<FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Optional…" rows={2} disabled={isSubmitting} {...field} /></FormControl></FormItem>)} />
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" disabled={isSubmitting} onClick={onCancel} className="px-4 py-2">Cancel</Button>
          <Button type="submit" variant="gold" disabled={isSubmitting} className="inline-flex items-center gap-2 px-5 py-2">{isSubmitting && <Loader2 className="size-4 animate-spin" />}Save</Button>
        </div>
      </form>
    </Form>
  );
}
