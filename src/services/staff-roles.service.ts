import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// ── Staff Role Assignments ─────────────────────────────────────────────────────

export interface StaffRoleAssignment {
  id: string;
  adminUserId: string;
  roleId: string;
  roleName: string;
  roleColor: string;
  isPrimary: boolean;
  expiresAt: string | null;
  assignedBy: string | null;
  assignedAt: string;
}

export type GetStaffRolesResult =
  | { success: true; data: StaffRoleAssignment[] }
  | { success: false; error: { message: string } };

export async function getStaffRoles(adminUserId: string): Promise<GetStaffRolesResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("staff_roles")
      .select("*, roles(name, color, slug)")
      .eq("admin_user_id", adminUserId);
    if (error) return { success: false, error: { message: error.message } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { success: true, data: (data ?? []).map((r: any) => ({
      id: r.id, adminUserId: r.admin_user_id, roleId: r.role_id,
      roleName: r.roles?.name ?? "", roleColor: r.roles?.color ?? "#6b7280",
      isPrimary: r.is_primary, expiresAt: r.expires_at,
      assignedBy: r.assigned_by, assignedAt: r.assigned_at,
    }))};
  } catch { return { success: false, error: { message: "Couldn't load staff roles." } }; }
}

export interface AssignRoleInput {
  adminUserId: string; roleId: string; isPrimary?: boolean;
  expiresAt?: string | null; assignedBy: string;
}
export type AssignRoleResult = { success: true } | { success: false; error: { message: string } };

export async function assignRole(input: AssignRoleInput): Promise<AssignRoleResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_roles").upsert({
      admin_user_id: input.adminUserId, role_id: input.roleId,
      is_primary: input.isPrimary ?? false,
      expires_at: input.expiresAt ?? null, assigned_by: input.assignedBy,
    }, { onConflict: "admin_user_id,role_id" });
    if (error) return { success: false, error: { message: error.message } };
    return { success: true };
  } catch { return { success: false, error: { message: "Couldn't assign role." } }; }
}

export async function removeRole(adminUserId: string, roleId: string): Promise<AssignRoleResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("staff_roles")
      .delete().eq("admin_user_id", adminUserId).eq("role_id", roleId);
    if (error) return { success: false, error: { message: error.message } };
    return { success: true };
  } catch { return { success: false, error: { message: "Couldn't remove role." } }; }
}

/** All staff with their assigned roles */
export interface StaffWithRoles {
  id: string; email: string; fullName: string | null;
  roles: { id: string; name: string; color: string; isPrimary: boolean }[];
}

export async function getAllStaffWithRoles(): Promise<
  { success: true; data: StaffWithRoles[] } | { success: false; error: { message: string } }
> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: staff, error: staffError } = await supabase
      .from("admin_users")
      .select("id, email, full_name, staff_roles(role_id, is_primary, roles(id, name, color))");
    if (staffError) return { success: false, error: { message: staffError.message } };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapped: StaffWithRoles[] = (staff ?? []).map((s: any) => ({
      id: s.id, email: s.email, fullName: s.full_name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      roles: (s.staff_roles ?? []).map((sr: any) => ({
        id: sr.roles?.id ?? sr.role_id,
        name: sr.roles?.name ?? "",
        color: sr.roles?.color ?? "#6b7280",
        isPrimary: sr.is_primary,
      })),
    }));
    return { success: true, data: mapped };
  } catch { return { success: false, error: { message: "Couldn't load staff." } }; }
}
