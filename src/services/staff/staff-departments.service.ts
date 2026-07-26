import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface StaffDeptError { code: string; message: string; }

export interface StaffDepartment {
  id: string;
  name: string;
  description: string | null;
  departmentHead: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export type GetDepartmentsResult =
  | { success: true; data: StaffDepartment[] }
  | { success: false; error: StaffDeptError };

export async function getDepartments(): Promise<GetDepartmentsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("staff_departments")
      .select("id, name, description, department_head, display_order, is_active, created_at")
      .order("display_order", { ascending: true });

    if (error) return { success: false, error: map(error, "load") };
    return {
      success: true,
      data: data.map((r) => ({
        id: r.id, name: r.name, description: r.description,
        departmentHead: r.department_head, displayOrder: r.display_order,
        isActive: r.is_active, createdAt: r.created_at,
      })),
    };
  } catch (err) {
    return { success: false, error: mapU(err) };
  }
}

export interface CreateDeptInput { name: string; description: string | null; departmentHead: string | null; displayOrder: number; isActive: boolean; }

export async function createDepartment(input: CreateDeptInput): Promise<{ success: true; data: StaffDepartment } | { success: false; error: StaffDeptError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("staff_departments")
      .insert({ name: input.name, description: input.description, department_head: input.departmentHead, display_order: input.displayOrder, is_active: input.isActive })
      .select("id, name, description, department_head, display_order, is_active, created_at")
      .single();
    if (error) return { success: false, error: map(error, "save") };
    return { success: true, data: { id: data.id, name: data.name, description: data.description, departmentHead: data.department_head, displayOrder: data.display_order, isActive: data.is_active, createdAt: data.created_at } };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export async function updateDepartment(id: string, input: CreateDeptInput): Promise<{ success: true } | { success: false; error: StaffDeptError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_departments").update({ name: input.name, description: input.description, department_head: input.departmentHead, display_order: input.displayOrder, is_active: input.isActive }).eq("id", id);
    if (error) return { success: false, error: map(error, "save") };
    return { success: true };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

export async function deleteDepartment(id: string): Promise<{ success: true } | { success: false; error: StaffDeptError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_departments").delete().eq("id", id);
    if (error) return { success: false, error: map(error, "delete") };
    return { success: true };
  } catch (err) { return { success: false, error: mapU(err) }; }
}

function map(e: PostgrestError, ctx: string): StaffDeptError {
  console.error(`[staff-departments.service] ${ctx}:`, e.message);
  return { code: "unexpected_error", message: ctx === "save" ? "We couldn't save that department." : ctx === "delete" ? "We couldn't delete that department." : "We couldn't load departments right now." };
}
function mapU(err: unknown): StaffDeptError {
  if (err instanceof TypeError) return { code: "network_error", message: "Network error. Check your connection." };
  return { code: "unexpected_error", message: "Something went wrong." };
}
