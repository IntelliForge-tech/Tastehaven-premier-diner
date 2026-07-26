import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface PermissionGroup {
  id: string; name: string; slug: string; description: string | null;
  icon: string; displayOrder: number;
}

export interface Permission {
  id: string; groupId: string; groupName: string; groupSlug: string;
  name: string; slug: string; description: string | null; createdAt: string;
}

export type GetPermissionsResult =
  | { success: true; groups: PermissionGroup[]; permissions: Permission[] }
  | { success: false; error: { message: string } };

export async function getPermissionsWithGroups(): Promise<GetPermissionsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const [groupsRes, permsRes] = await Promise.all([
      supabase.from("permission_groups").select("*").order("display_order"),
      supabase.from("permissions").select("*, permission_groups(name, slug)"),
    ]);
    if (groupsRes.error) return { success: false, error: { message: groupsRes.error.message } };
    if (permsRes.error) return { success: false, error: { message: permsRes.error.message } };

    const groups: PermissionGroup[] = (groupsRes.data ?? []).map((g) => ({
      id: g.id, name: g.name, slug: g.slug, description: g.description,
      icon: g.icon, displayOrder: g.display_order,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const permissions: Permission[] = (permsRes.data ?? []).map((p: any) => ({
      id: p.id, groupId: p.group_id,
      groupName: p.permission_groups?.name ?? "",
      groupSlug: p.permission_groups?.slug ?? "",
      name: p.name, slug: p.slug, description: p.description, createdAt: p.created_at,
    }));

    return { success: true, groups, permissions };
  } catch { return { success: false, error: { message: "Couldn't load permissions." } }; }
}

/** Permissions for a specific role — returns set of permission slugs */
export type GetRolePermissionsResult =
  | { success: true; slugs: Set<string>; ids: Map<string, string> }
  | { success: false; error: { message: string } };

export async function getRolePermissions(roleId: string): Promise<GetRolePermissionsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("role_permissions")
      .select("permission_id, permissions(slug)")
      .eq("role_id", roleId);
    if (error) return { success: false, error: { message: error.message } };

    const slugs = new Set<string>();
    const ids = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data ?? []).forEach((row: any) => {
      const slug = row.permissions?.slug;
      if (slug) { slugs.add(slug); ids.set(slug, row.permission_id); }
    });
    return { success: true, slugs, ids };
  } catch { return { success: false, error: { message: "Couldn't load role permissions." } }; }
}

export type GrantPermissionResult = { success: true } | { success: false; error: { message: string } };

export async function grantPermission(
  roleId: string, permissionId: string, grantedBy: string
): Promise<GrantPermissionResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("role_permissions").upsert(
      { role_id: roleId, permission_id: permissionId, granted_by: grantedBy },
      { onConflict: "role_id,permission_id" }
    );
    if (error) return { success: false, error: { message: error.message } };
    return { success: true };
  } catch { return { success: false, error: { message: "Couldn't grant permission." } }; }
}

export async function revokePermission(
  roleId: string, permissionId: string
): Promise<GrantPermissionResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("role_permissions")
      .delete().eq("role_id", roleId).eq("permission_id", permissionId);
    if (error) return { success: false, error: { message: error.message } };
    return { success: true };
  } catch { return { success: false, error: { message: "Couldn't revoke permission." } }; }
}

/** Bulk-replace all permissions for a role */
export async function setRolePermissions(
  roleId: string, permissionIds: string[], grantedBy: string
): Promise<GrantPermissionResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("role_permissions").delete().eq("role_id", roleId);
    if (permissionIds.length > 0) {
      const rows = permissionIds.map((pid) => ({
        role_id: roleId, permission_id: pid, granted_by: grantedBy,
      }));
      const { error } = await supabase.from("role_permissions").insert(rows);
      if (error) return { success: false, error: { message: error.message } };
    }
    return { success: true };
  } catch { return { success: false, error: { message: "Couldn't update permissions." } }; }
}

/** Current admin user's effective permission slugs (from their assigned roles) */
export async function getMyPermissions(adminUserId: string): Promise<Set<string>> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("staff_roles")
      .select("roles(role_permissions(permissions(slug)))")
      .eq("admin_user_id", adminUserId);
    const slugs = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data ?? []).forEach((sr: any) => {
      (sr.roles?.role_permissions ?? []).forEach((rp: any) => {
        const slug = rp.permissions?.slug;
        if (slug) slugs.add(slug);
      });
    });
    return slugs;
  } catch { return new Set<string>(); }
}
