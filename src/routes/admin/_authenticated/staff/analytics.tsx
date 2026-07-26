import { createFileRoute } from "@tanstack/react-router";

import { StaffAnalyticsCards } from "@/components/admin/staff/StaffAnalyticsCards";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { useStaff } from "@/hooks/useStaff";
import { useAttendance } from "@/hooks/useAttendance";
import { useDepartments } from "@/hooks/useDepartments";
import { useStaffAnalytics } from "@/hooks/useStaffAnalytics";

export const Route = createFileRoute("/admin/_authenticated/staff/analytics")({
  component: AdminStaffAnalyticsPage,
  head: () => ({ meta: [{ title: "Staff Analytics — Admin — Taste Haven" }] }),
});

function AdminStaffAnalyticsPage() {
  const { staff, isLoading: staffLoading } = useStaff();
  const { attendance, isLoading: attendanceLoading } = useAttendance();
  const { departments, isLoading: deptsLoading } = useDepartments();

  const analytics = useStaffAnalytics(staff, attendance, departments.length);

  const isLoading = staffLoading || attendanceLoading || deptsLoading;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Staff Analytics" />
      <PageHeader
        title="Staff Analytics"
        description="Overview of your team's composition, attendance, and upcoming events."
      />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 7 }, (_, i) => <div key={i} className="h-24 rounded-xl bg-muted" />)}
          </div>
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      ) : (
        <StaffAnalyticsCards analytics={analytics} />
      )}
    </div>
  );
}
