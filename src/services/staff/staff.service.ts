import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type StaffErrorCode = "network_error" | "not_found" | "upload_error" | "unexpected_error";

export interface StaffError {
  code: StaffErrorCode;
  message: string;
}

export type EmploymentStatus =
  | "active"
  | "inactive"
  | "on_leave"
  | "suspended"
  | "resigned"
  | "terminated"
  | "probation"
  | "retired";

export interface StaffMember {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  joiningDate: string;
  employmentStatus: EmploymentStatus;
  departmentId: string | null;
  designationId: string | null;
  shiftId: string | null;
  managerId: string | null;
  salary: number | null;
  notes: string | null;
  profilePhotoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Joined fields
  departmentName?: string | null;
  designationTitle?: string | null;
  shiftName?: string | null;
}

export type GetStaffResult =
  | { success: true; data: StaffMember[] }
  | { success: false; error: StaffError };

export async function getStaff(): Promise<GetStaffResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("staff_members")
      .select(`
        id, employee_id, first_name, last_name, email, phone,
        date_of_birth, gender, address, city, country,
        emergency_contact, emergency_phone, joining_date,
        employment_status, department_id, designation_id, shift_id,
        manager_id, salary, notes, profile_photo_url, is_active,
        created_at, updated_at,
        staff_departments(name),
        staff_designations(title),
        staff_shifts(name)
      `)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: mapError(error, "load") };

    return {
      success: true,
      data: data.map((r) => mapRow(r)),
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export async function getStaffMember(id: string): Promise<{ success: true; data: StaffMember } | { success: false; error: StaffError }> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("staff_members")
      .select(`
        id, employee_id, first_name, last_name, email, phone,
        date_of_birth, gender, address, city, country,
        emergency_contact, emergency_phone, joining_date,
        employment_status, department_id, designation_id, shift_id,
        manager_id, salary, notes, profile_photo_url, is_active,
        created_at, updated_at,
        staff_departments(name),
        staff_designations(title),
        staff_shifts(name)
      `)
      .eq("id", id)
      .single();

    if (error) return { success: false, error: mapError(error, "load") };
    return { success: true, data: mapRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export interface CreateStaffInput {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  joiningDate: string;
  employmentStatus: EmploymentStatus;
  departmentId: string | null;
  designationId: string | null;
  shiftId: string | null;
  managerId: string | null;
  salary: number | null;
  notes: string | null;
  isActive: boolean;
}

export type CreateStaffResult =
  | { success: true; data: StaffMember }
  | { success: false; error: StaffError };

export async function createStaffMember(input: CreateStaffInput): Promise<CreateStaffResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("staff_members")
      .insert({
        employee_id: input.employeeId,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        date_of_birth: input.dateOfBirth,
        gender: input.gender,
        address: input.address,
        city: input.city,
        country: input.country,
        emergency_contact: input.emergencyContact,
        emergency_phone: input.emergencyPhone,
        joining_date: input.joiningDate,
        employment_status: input.employmentStatus,
        department_id: input.departmentId,
        designation_id: input.designationId,
        shift_id: input.shiftId,
        manager_id: input.managerId,
        salary: input.salary,
        notes: input.notes,
        is_active: input.isActive,
      })
      .select("id, employee_id, first_name, last_name, email, phone, date_of_birth, gender, address, city, country, emergency_contact, emergency_phone, joining_date, employment_status, department_id, designation_id, shift_id, manager_id, salary, notes, profile_photo_url, is_active, created_at, updated_at")
      .single();

    if (error) return { success: false, error: mapError(error, "save") };
    return { success: true, data: mapRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export interface UpdateStaffInput extends CreateStaffInput {
  id: string;
}

export type UpdateStaffResult = { success: true } | { success: false; error: StaffError };

export async function updateStaffMember(input: UpdateStaffInput): Promise<UpdateStaffResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("staff_members")
      .update({
        employee_id: input.employeeId,
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        phone: input.phone,
        date_of_birth: input.dateOfBirth,
        gender: input.gender,
        address: input.address,
        city: input.city,
        country: input.country,
        emergency_contact: input.emergencyContact,
        emergency_phone: input.emergencyPhone,
        joining_date: input.joiningDate,
        employment_status: input.employmentStatus,
        department_id: input.departmentId,
        designation_id: input.designationId,
        shift_id: input.shiftId,
        manager_id: input.managerId,
        salary: input.salary,
        notes: input.notes,
        is_active: input.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id);

    if (error) return { success: false, error: mapError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export type DeleteStaffResult = { success: true } | { success: false; error: StaffError };

export async function deleteStaffMember(id: string): Promise<DeleteStaffResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_members").delete().eq("id", id);
    if (error) return { success: false, error: mapError(error, "delete") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export async function updateEmploymentStatus(id: string, status: EmploymentStatus): Promise<UpdateStaffResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("staff_members")
      .update({ employment_status: status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { success: false, error: mapError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

type StaffRow = Record<string, unknown>;

function mapRow(r: StaffRow): StaffMember {
  const dept = r["staff_departments"] as { name?: string } | null;
  const desig = r["staff_designations"] as { title?: string } | null;
  const shift = r["staff_shifts"] as { name?: string } | null;

  return {
    id: String(r["id"]),
    employeeId: String(r["employee_id"]),
    firstName: String(r["first_name"]),
    lastName: String(r["last_name"]),
    email: String(r["email"]),
    phone: r["phone"] as string | null,
    dateOfBirth: r["date_of_birth"] as string | null,
    gender: r["gender"] as string | null,
    address: r["address"] as string | null,
    city: r["city"] as string | null,
    country: r["country"] as string | null,
    emergencyContact: r["emergency_contact"] as string | null,
    emergencyPhone: r["emergency_phone"] as string | null,
    joiningDate: String(r["joining_date"]),
    employmentStatus: (r["employment_status"] as EmploymentStatus) ?? "active",
    departmentId: r["department_id"] as string | null,
    designationId: r["designation_id"] as string | null,
    shiftId: r["shift_id"] as string | null,
    managerId: r["manager_id"] as string | null,
    salary: r["salary"] as number | null,
    notes: r["notes"] as string | null,
    profilePhotoUrl: r["profile_photo_url"] as string | null,
    isActive: Boolean(r["is_active"]),
    createdAt: String(r["created_at"]),
    updatedAt: String(r["updated_at"]),
    departmentName: dept?.name ?? null,
    designationTitle: desig?.title ?? null,
    shiftName: shift?.name ?? null,
  };
}

function mapError(e: PostgrestError, ctx: "load" | "save" | "delete"): StaffError {
  console.error(`[staff.service] ${ctx}:`, e.message);
  return {
    code: "unexpected_error",
    message:
      ctx === "save" ? "We couldn't save that employee record. Please try again."
      : ctx === "delete" ? "We couldn't delete that employee. Please try again."
      : "We couldn't load staff records right now. Please try again.",
  };
}

function mapUnexpected(err: unknown): StaffError {
  if (err instanceof TypeError) return { code: "network_error", message: "We couldn't reach the server. Check your connection." };
  return { code: "unexpected_error", message: "Something went wrong. Please try again." };
}
