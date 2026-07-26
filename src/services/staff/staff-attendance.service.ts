import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface AttendanceError { code: string; message: string; }

export type AttendanceStatus = "present" | "absent" | "late" | "half_day" | "overtime" | "on_leave";

export interface AttendanceRecord {
  id: string;
  staffMemberId: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number | null;
  status: AttendanceStatus;
  lateMinutes: number;
  overtimeMinutes: number;
  notes: string | null;
  createdAt: string;
}

export type GetAttendanceResult =
  | { success: true; data: AttendanceRecord[] }
  | { success: false; error: AttendanceError };

export async function getAttendance(staffMemberId?: string, dateFrom?: string, dateTo?: string): Promise<GetAttendanceResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("staff_attendance")
      .select("id, staff_member_id, attendance_date, check_in, check_out, working_hours, status, late_minutes, overtime_minutes, notes, created_at")
      .order("attendance_date", { ascending: false });

    if (staffMemberId) query = query.eq("staff_member_id", staffMemberId);
    if (dateFrom) query = query.gte("attendance_date", dateFrom);
    if (dateTo) query = query.lte("attendance_date", dateTo);

    const { data, error } = await query;
    if (error) return { success: false, error: map(error, "load") };

    return {
      success: true,
      data: data.map((r) => ({
        id: r.id, staffMemberId: r.staff_member_id, attendanceDate: r.attendance_date,
        checkIn: r.check_in, checkOut: r.check_out, workingHours: r.working_hours,
        status: r.status as AttendanceStatus, lateMinutes: r.late_minutes ?? 0,
        overtimeMinutes: r.overtime_minutes ?? 0, notes: r.notes, createdAt: r.created_at,
      })),
    };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export interface UpsertAttendanceInput {
  staffMemberId: string;
  attendanceDate: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number | null;
  status: AttendanceStatus;
  lateMinutes: number;
  overtimeMinutes: number;
  notes: string | null;
}

export async function upsertAttendance(input: UpsertAttendanceInput): Promise<{ success: true } | { success: false; error: AttendanceError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_attendance").upsert({
      staff_member_id: input.staffMemberId, attendance_date: input.attendanceDate,
      check_in: input.checkIn, check_out: input.checkOut, working_hours: input.workingHours,
      status: input.status, late_minutes: input.lateMinutes, overtime_minutes: input.overtimeMinutes,
      notes: input.notes,
    }, { onConflict: "staff_member_id,attendance_date" });
    if (error) return { success: false, error: map(error, "save") };
    return { success: true };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

function map(e: PostgrestError, ctx: string): AttendanceError {
  console.error(`[staff-attendance.service] ${ctx}:`, e.message);
  return { code: "unexpected_error", message: ctx === "save" ? "We couldn't save attendance. Please try again." : "We couldn't load attendance right now." };
}
function mapU(err: unknown): AttendanceError {
  if (err instanceof TypeError) return { code: "network_error", message: "Network error." };
  return { code: "unexpected_error", message: "Something went wrong." };
}
