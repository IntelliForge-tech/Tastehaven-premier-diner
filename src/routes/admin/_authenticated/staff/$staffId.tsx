import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { StaffProfileCard } from "@/components/admin/staff/StaffProfileCard";
import { EmployeeStatusBadge } from "@/components/admin/staff/EmployeeStatusBadge";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useStaff } from "@/hooks/useStaff";
import { useAttendance } from "@/hooks/useAttendance";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { usePerformance } from "@/hooks/usePerformance";

export const Route = createFileRoute("/admin/_authenticated/staff/$staffId")({
  component: StaffProfilePage,
  head: () => ({ meta: [{ title: "Employee Profile — Admin — Taste Haven" }] }),
});

const LEAVE_TYPE_LABELS: Record<string, string> = {
  sick: "Sick", casual: "Casual", paid: "Paid", emergency: "Emergency",
  maternity: "Maternity", paternity: "Paternity", vacation: "Vacation", unpaid: "Unpaid",
};

function StaffProfilePage() {
  const { staffId } = Route.useParams();
  const { member, isLoading } = useStaff().staff.find((s) => s.id === staffId)
    ? { member: useStaff().staff.find((s) => s.id === staffId)!, isLoading: false }
    : { member: null, isLoading: useStaff().isLoading };

  // Use module-level hooks correctly
  const { staff, isLoading: staffLoading } = useStaff();
  const foundMember = staff.find((s) => s.id === staffId) ?? null;

  const { attendance } = useAttendance(staffId);
  const { requests: leaveRequests } = useLeaveRequests(staffId);
  const { records: perfRecords } = usePerformance(staffId);

  if (staffLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Employee Profile" />
        <div className="animate-pulse space-y-4">
          <div className="h-40 rounded-2xl bg-muted" />
          <div className="h-60 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!foundMember) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Employee Profile" />
        <SectionContainer>
          <div className="py-8 text-center">
            <p className="font-medium text-foreground">Employee not found.</p>
            <Link to="/admin/staff" className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
              <ArrowLeft className="size-4" />Back to staff list
            </Link>
          </div>
        </SectionContainer>
      </div>
    );
  }

  const m = foundMember;
  const recentAttendance = attendance.slice(0, 10);
  const latestPerf = perfRecords[0];

  return (
    <div className="space-y-6">
      <Breadcrumbs page={`${m.firstName} ${m.lastName}`} />

      <div className="flex items-center gap-3">
        <Link to="/admin/staff" className="grid size-8 place-items-center rounded-full border border-border text-muted-foreground hover:bg-muted">
          <ArrowLeft className="size-4" />
        </Link>
        <PageHeader
          title={`${m.firstName} ${m.lastName}`}
          description={`${m.designationTitle ?? "—"} · ${m.departmentName ?? "—"}`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left — Profile card */}
        <StaffProfileCard member={m} />

        {/* Right — Tabs: attendance, leave, performance */}
        <div className="space-y-4">
          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="font-display text-2xl font-bold text-foreground">{attendance.filter((a) => a.status === "present" || a.status === "late").length}</p>
              <p className="text-xs text-muted-foreground">Days Present</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="font-display text-2xl font-bold text-foreground">{leaveRequests.filter((r) => r.status === "approved").length}</p>
              <p className="text-xs text-muted-foreground">Leaves Taken</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <p className="font-display text-2xl font-bold text-foreground">{latestPerf?.overallRating ?? "—"}</p>
              <p className="text-xs text-muted-foreground">Latest Rating</p>
            </div>
          </div>

          {/* Recent attendance */}
          <SectionContainer>
            <h3 className="mb-3 font-display text-base font-semibold text-foreground">Recent Attendance</h3>
            {recentAttendance.length === 0 ? (
              <p className="text-sm text-muted-foreground">No attendance records yet.</p>
            ) : (
              <div className="space-y-1">
                {recentAttendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">{a.attendanceDate}</span>
                    <span className="capitalize font-medium text-foreground">{a.status.replace("_", " ")}</span>
                    {a.checkIn && <span className="text-xs text-muted-foreground">{a.checkIn} – {a.checkOut ?? "—"}</span>}
                  </div>
                ))}
              </div>
            )}
          </SectionContainer>

          {/* Leave requests */}
          <SectionContainer>
            <h3 className="mb-3 font-display text-base font-semibold text-foreground">Leave Requests</h3>
            {leaveRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No leave requests.</p>
            ) : (
              <div className="space-y-2">
                {leaveRequests.slice(0, 5).map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                    <span className="font-medium text-foreground">{LEAVE_TYPE_LABELS[req.leaveType] ?? req.leaveType}</span>
                    <span className="text-muted-foreground">{req.startDate} – {req.endDate}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      req.status === "approved" ? "bg-emerald-100 text-emerald-800"
                      : req.status === "rejected" ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>{req.status}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionContainer>

          {/* Notes */}
          {m.notes && (
            <SectionContainer>
              <h3 className="mb-2 font-display text-base font-semibold text-foreground">Private Notes</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{m.notes}</p>
            </SectionContainer>
          )}
        </div>
      </div>
    </div>
  );
}
