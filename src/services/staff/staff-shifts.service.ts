import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface StaffShiftError { code: string; message: string; }

export interface StaffShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  workingHours: number;
  isActive: boolean;
  createdAt: string;
}

export type GetShiftsResult =
  | { success: true; data: StaffShift[] }
  | { success: false; error: StaffShiftError };

export async function getShifts(): Promise<GetShiftsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("staff_shifts")
      .select("id, name, start_time, end_time, break_minutes, working_hours, is_active, created_at")
      .order("start_time", { ascending: true });

    if (error) return { success: false, error: map(error, "load") };
    return {
      success: true,
      data: data.map((r) => ({
        id: r.id, name: r.name, startTime: r.start_time, endTime: r.end_time,
        breakMinutes: r.break_minutes ?? 0, workingHours: r.working_hours ?? 0,
        isActive: r.is_active, createdAt: r.created_at,
      })),
    };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export interface CreateShiftInput { name: string; startTime: string; endTime: string; breakMinutes: number; workingHours: number; isActive: boolean; }

export async function createShift(input: CreateShiftInput): Promise<{ success: true; data: StaffShift } | { success: false; error: StaffShiftError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("staff_shifts")
      .insert({ name: input.name, start_time: input.startTime, end_time: input.endTime, break_minutes: input.breakMinutes, working_hours: input.workingHours, is_active: input.isActive })
      .select("id, name, start_time, end_time, break_minutes, working_hours, is_active, created_at")
      .single();
    if (error) return { success: false, error: map(error, "save") };
    return { success: true, data: { id: data.id, name: data.name, startTime: data.start_time, endTime: data.end_time, breakMinutes: data.break_minutes, workingHours: data.working_hours, isActive: data.is_active, createdAt: data.created_at } };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export async function updateShift(id: string, input: CreateShiftInput): Promise<{ success: true } | { success: false; error: StaffShiftError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_shifts").update({ name: input.name, start_time: input.startTime, end_time: input.endTime, break_minutes: input.breakMinutes, working_hours: input.workingHours, is_active: input.isActive }).eq("id", id);
    if (error) return { success: false, error: map(error, "save") };
    return { success: true };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export async function deleteShift(id: string): Promise<{ success: true } | { success: false; error: StaffShiftError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_shifts").delete().eq("id", id);
    if (error) return { success: false, error: map(error, "delete") };
    return { success: true };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

function map(e: PostgrestError, ctx: string): StaffShiftError {
  console.error(`[staff-shifts.service] ${ctx}:`, e.message);
  return { code: "unexpected_error", message: ctx === "save" ? "We couldn't save that shift." : ctx === "delete" ? "We couldn't delete that shift." : "We couldn't load shifts right now." };
}
function mapU(err: unknown): StaffShiftError {
  if (err instanceof TypeError) return { code: "network_error", message: "Network error." };
  return { code: "unexpected_error", message: "Something went wrong." };
}
