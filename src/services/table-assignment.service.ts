import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AssignmentErrorCode = "network_error" | "not_found" | "conflict" | "unexpected_error";

export interface AssignmentError {
  code: AssignmentErrorCode;
  message: string;
}

export type AssignmentStatus = "active" | "released" | "cancelled";

export interface TableAssignment {
  id: string;
  reservationId: string;
  tableId: string;
  assignedBy: string | null;
  assignedAt: string;
  releasedAt: string | null;
  status: AssignmentStatus;
}

export type GetAssignmentsResult =
  | { success: true; data: TableAssignment[] }
  | { success: false; error: AssignmentError };

export async function getActiveAssignments(): Promise<GetAssignmentsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("table_assignments")
      .select("id, reservation_id, table_id, assigned_by, assigned_at, released_at, status")
      .eq("status", "active");

    if (error) return { success: false, error: mapError(error, "load") };

    return {
      success: true,
      data: data.map((r) => ({
        id: r.id,
        reservationId: r.reservation_id,
        tableId: r.table_id,
        assignedBy: r.assigned_by,
        assignedAt: r.assigned_at,
        releasedAt: r.released_at,
        status: r.status as AssignmentStatus,
      })),
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export async function getAssignmentsForTable(tableId: string): Promise<GetAssignmentsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("table_assignments")
      .select("id, reservation_id, table_id, assigned_by, assigned_at, released_at, status")
      .eq("table_id", tableId)
      .order("assigned_at", { ascending: false })
      .limit(20);

    if (error) return { success: false, error: mapError(error, "load") };

    return {
      success: true,
      data: data.map((r) => ({
        id: r.id,
        reservationId: r.reservation_id,
        tableId: r.table_id,
        assignedBy: r.assigned_by,
        assignedAt: r.assigned_at,
        releasedAt: r.released_at,
        status: r.status as AssignmentStatus,
      })),
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export interface AssignTableInput {
  reservationId: string;
  tableId: string;
  assignedBy: string | null;
}

export type AssignTableResult =
  | { success: true; data: TableAssignment }
  | { success: false; error: AssignmentError };

export async function assignTable(input: AssignTableInput): Promise<AssignTableResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    // Check for existing active assignment on this table
    const { data: existing } = await supabase
      .from("table_assignments")
      .select("id")
      .eq("table_id", input.tableId)
      .eq("status", "active")
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: {
          code: "conflict",
          message: "This table already has an active assignment. Release it first before reassigning.",
        },
      };
    }

    const { data, error } = await supabase
      .from("table_assignments")
      .insert({
        reservation_id: input.reservationId,
        table_id: input.tableId,
        assigned_by: input.assignedBy,
        status: "active",
      })
      .select("id, reservation_id, table_id, assigned_by, assigned_at, released_at, status")
      .single();

    if (error) return { success: false, error: mapError(error, "save") };

    return {
      success: true,
      data: {
        id: data.id,
        reservationId: data.reservation_id,
        tableId: data.table_id,
        assignedBy: data.assigned_by,
        assignedAt: data.assigned_at,
        releasedAt: data.released_at,
        status: data.status as AssignmentStatus,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export type ReleaseTableResult =
  | { success: true }
  | { success: false; error: AssignmentError };

export async function releaseTableAssignment(assignmentId: string): Promise<ReleaseTableResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("table_assignments")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", assignmentId);

    if (error) return { success: false, error: mapError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

function mapError(e: PostgrestError, ctx: "load" | "save"): AssignmentError {
  console.error(`[table-assignment.service] ${ctx}:`, e.message);
  return {
    code: "unexpected_error",
    message: ctx === "save"
      ? "We couldn't save the table assignment. Please try again."
      : "We couldn't load assignments right now. Please try again.",
  };
}

function mapUnexpected(err: unknown): AssignmentError {
  if (err instanceof TypeError) {
    return { code: "network_error", message: "We couldn't reach the server. Check your connection." };
  }
  return { code: "unexpected_error", message: "Something went wrong. Please try again." };
}
