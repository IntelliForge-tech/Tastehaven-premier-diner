import { useMemo } from "react";
import { computeStaffAnalytics } from "@/services/staff/staff-analytics.service";
import type { StaffMember } from "@/services/staff/staff.service";
import type { AttendanceRecord } from "@/services/staff/staff-attendance.service";

export function useStaffAnalytics(
  staff: StaffMember[],
  attendance: AttendanceRecord[],
  departmentCount: number,
) {
  return useMemo(
    () => computeStaffAnalytics(staff, attendance, departmentCount),
    [staff, attendance, departmentCount],
  );
}
