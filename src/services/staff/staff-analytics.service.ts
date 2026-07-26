import type { StaffMember } from "./staff.service";
import type { AttendanceRecord } from "./staff-attendance.service";

export interface StaffAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  departmentCount: number;
  todayPresent: number;
  todayLate: number;
  todayAbsent: number;
  avgAttendanceScore: number;
  upcomingBirthdays: StaffMember[];
  upcomingAnniversaries: StaffMember[];
  longestServing: StaffMember | null;
  statusBreakdown: Record<string, number>;
}

const today = () => new Date().toISOString().slice(0, 10);

export function computeStaffAnalytics(
  staff: StaffMember[],
  attendance: AttendanceRecord[],
  departmentCount: number,
): StaffAnalytics {
  const todayStr = today();
  const todayAttendance = attendance.filter((a) => a.attendanceDate === todayStr);

  const statusBreakdown: Record<string, number> = {};
  for (const s of staff) {
    statusBreakdown[s.employmentStatus] = (statusBreakdown[s.employmentStatus] ?? 0) + 1;
  }

  // Upcoming birthdays (next 30 days)
  const now = new Date();
  const upcomingBirthdays = staff.filter((s) => {
    if (!s.dateOfBirth) return false;
    const dob = new Date(s.dateOfBirth);
    const next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    const diff = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  });

  // Upcoming work anniversaries (next 30 days)
  const upcomingAnniversaries = staff.filter((s) => {
    const join = new Date(s.joiningDate);
    const next = new Date(now.getFullYear(), join.getMonth(), join.getDate());
    if (next < now) next.setFullYear(now.getFullYear() + 1);
    const diff = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30 && diff > 0;
  });

  // Longest serving
  const longestServing = staff.reduce<StaffMember | null>((best, s) => {
    if (!best) return s;
    return new Date(s.joiningDate) < new Date(best.joiningDate) ? s : best;
  }, null);

  const presentToday = todayAttendance.filter((a) => a.status === "present" || a.status === "late" || a.status === "overtime").length;
  const lateToday = todayAttendance.filter((a) => a.status === "late").length;

  return {
    totalEmployees: staff.length,
    activeEmployees: staff.filter((s) => s.employmentStatus === "active").length,
    onLeave: staff.filter((s) => s.employmentStatus === "on_leave").length,
    departmentCount,
    todayPresent: presentToday,
    todayLate: lateToday,
    todayAbsent: staff.filter((s) => s.isActive).length - presentToday,
    avgAttendanceScore: 0,
    upcomingBirthdays,
    upcomingAnniversaries,
    longestServing,
    statusBreakdown,
  };
}
