import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface PerfError { code: string; message: string; }

export type ReviewPeriod = "monthly" | "quarterly" | "annual";

export interface PerformanceRecord {
  id: string;
  staffMemberId: string;
  reviewPeriod: ReviewPeriod;
  reviewDate: string;
  tasksCompleted: number;
  customerRating: number | null;
  attendanceScore: number | null;
  punctualityScore: number | null;
  overallRating: number;
  managerFeedback: string | null;
  achievements: string | null;
  areasForImprovement: string | null;
  warnings: number;
  awards: string | null;
  trainingCompleted: string | null;
  createdAt: string;
  staffName?: string | null;
}

export type GetPerformanceResult =
  | { success: true; data: PerformanceRecord[] }
  | { success: false; error: PerfError };

export async function getPerformance(staffMemberId?: string): Promise<GetPerformanceResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("staff_performance")
      .select("id, staff_member_id, review_period, review_date, tasks_completed, customer_rating, attendance_score, punctuality_score, overall_rating, manager_feedback, achievements, areas_for_improvement, warnings, awards, training_completed, created_at, staff_members(first_name, last_name)")
      .order("review_date", { ascending: false });

    if (staffMemberId) query = query.eq("staff_member_id", staffMemberId);

    const { data, error } = await query;
    if (error) return { success: false, error: map(error, "load") };

    return {
      success: true,
      data: data.map((r) => {
        const member = r["staff_members"] as { first_name?: string; last_name?: string } | null;
        return {
          id: r.id, staffMemberId: r.staff_member_id, reviewPeriod: r.review_period as ReviewPeriod,
          reviewDate: r.review_date, tasksCompleted: r.tasks_completed ?? 0,
          customerRating: r.customer_rating, attendanceScore: r.attendance_score,
          punctualityScore: r.punctuality_score, overallRating: r.overall_rating ?? 0,
          managerFeedback: r.manager_feedback, achievements: r.achievements,
          areasForImprovement: r.areas_for_improvement, warnings: r.warnings ?? 0,
          awards: r.awards, trainingCompleted: r.training_completed, createdAt: r.created_at,
          staffName: member ? `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() : null,
        };
      }),
    };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export interface CreatePerformanceInput {
  staffMemberId: string; reviewPeriod: ReviewPeriod; reviewDate: string;
  tasksCompleted: number; customerRating: number | null; attendanceScore: number | null;
  punctualityScore: number | null; overallRating: number; managerFeedback: string | null;
  achievements: string | null; areasForImprovement: string | null; warnings: number;
  awards: string | null; trainingCompleted: string | null;
}

export async function createPerformanceRecord(input: CreatePerformanceInput): Promise<{ success: true } | { success: false; error: PerfError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_performance").insert({
      staff_member_id: input.staffMemberId, review_period: input.reviewPeriod,
      review_date: input.reviewDate, tasks_completed: input.tasksCompleted,
      customer_rating: input.customerRating, attendance_score: input.attendanceScore,
      punctuality_score: input.punctualityScore, overall_rating: input.overallRating,
      manager_feedback: input.managerFeedback, achievements: input.achievements,
      areas_for_improvement: input.areasForImprovement, warnings: input.warnings,
      awards: input.awards, training_completed: input.trainingCompleted,
    });
    if (error) return { success: false, error: map(error, "save") };
    return { success: true };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

function map(e: PostgrestError, ctx: string): PerfError {
  console.error(`[staff-performance.service] ${ctx}:`, e.message);
  return { code: "unexpected_error", message: ctx === "save" ? "We couldn't save that performance record." : "We couldn't load performance data." };
}
function mapU(err: unknown): PerfError {
  if (err instanceof TypeError) return { code: "network_error", message: "Network error." };
  return { code: "unexpected_error", message: "Something went wrong." };
}
