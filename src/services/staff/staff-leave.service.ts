import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface LeaveError { code: string; message: string; }

export type LeaveType = "sick" | "casual" | "paid" | "emergency" | "maternity" | "paternity" | "vacation" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  staffMemberId: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string | null;
  status: LeaveStatus;
  approvedBy: string | null;
  approvalDate: string | null;
  rejectionReason: string | null;
  createdAt: string;
  staffName?: string | null;
}

export type GetLeaveResult =
  | { success: true; data: LeaveRequest[] }
  | { success: false; error: LeaveError };

export async function getLeaveRequests(staffMemberId?: string): Promise<GetLeaveResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("staff_leave_requests")
      .select("id, staff_member_id, leave_type, start_date, end_date, total_days, reason, status, approved_by, approval_date, rejection_reason, created_at, staff_members(first_name, last_name)")
      .order("created_at", { ascending: false });

    if (staffMemberId) query = query.eq("staff_member_id", staffMemberId);

    const { data, error } = await query;
    if (error) return { success: false, error: map(error, "load") };

    return {
      success: true,
      data: data.map((r) => {
        const member = r["staff_members"] as { first_name?: string; last_name?: string } | null;
        return {
          id: r.id, staffMemberId: r.staff_member_id, leaveType: r.leave_type as LeaveType,
          startDate: r.start_date, endDate: r.end_date, totalDays: r.total_days ?? 1,
          reason: r.reason, status: r.status as LeaveStatus, approvedBy: r.approved_by,
          approvalDate: r.approval_date, rejectionReason: r.rejection_reason, createdAt: r.created_at,
          staffName: member ? `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() : null,
        };
      }),
    };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export interface CreateLeaveInput { staffMemberId: string; leaveType: LeaveType; startDate: string; endDate: string; totalDays: number; reason: string | null; }

export async function createLeaveRequest(input: CreateLeaveInput): Promise<{ success: true } | { success: false; error: LeaveError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_leave_requests").insert({ staff_member_id: input.staffMemberId, leave_type: input.leaveType, start_date: input.startDate, end_date: input.endDate, total_days: input.totalDays, reason: input.reason, status: "pending" });
    if (error) return { success: false, error: map(error, "save") };
    return { success: true };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export async function updateLeaveStatus(id: string, status: LeaveStatus, approvedBy?: string | null, rejectionReason?: string | null): Promise<{ success: true } | { success: false; error: LeaveError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_leave_requests").update({ status, approved_by: approvedBy ?? null, approval_date: status === "approved" ? new Date().toISOString() : null, rejection_reason: rejectionReason ?? null }).eq("id", id);
    if (error) return { success: false, error: map(error, "save") };
    return { success: true };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

function map(e: PostgrestError, ctx: string): LeaveError {
  console.error(`[staff-leave.service] ${ctx}:`, e.message);
  return { code: "unexpected_error", message: ctx === "save" ? "We couldn't save that leave request." : "We couldn't load leave requests." };
}
function mapU(err: unknown): LeaveError {
  if (err instanceof TypeError) return { code: "network_error", message: "Network error." };
  return { code: "unexpected_error", message: "Something went wrong." };
}
