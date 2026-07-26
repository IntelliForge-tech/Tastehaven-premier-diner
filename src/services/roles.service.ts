import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string;
  priority: number;
  displayOrder: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  /** Populated by joined query */
  permissionCount?: number;
  staffCount?: number;
}

export interface RoleServiceError { message: string; }

export type GetRolesResult =
  | { success: true; data: Role[] }
  | { success: false; error: RoleServiceError };

export async function getRoles(): Promise<GetRolesResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("roles")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) return { success: false, error: { message: error.message } };
    return { success: true, data: (data ?? []).map(mapRole) };
  } catch { return { success: false, error: { message: "Couldn't load roles." } }; }
}

export interface CreateRoleInput {
  name: string; slug: string; description?: string | null;
  color: string; icon: string; priority: number; displayOrder: number;
}
export type CreateRoleResult = { success: true; data: Role } | { success: false; error: RoleServiceError };

export async function createRole(input: CreateRoleInput): Promise<CreateRoleResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.from("roles").insert({
      name: input.name, slug: input.slug, description: input.description,
      color: input.color, icon: input.icon, priority: input.priority,
      display_order: input.displayOrder, is_system: false, is_active: true,
    }).select().single();
    if (error) return { success: false, error: { message: error.message } };
    return { success: true, data: mapRole(data) };
  } catch { return { success: false, error: { message: "Couldn't create role." } }; }
}

export interface UpdateRoleInput extends Partial<CreateRoleInput> { isActive?: boolean; }
export type UpdateRoleResult = { success: true } | { success: false; error: RoleServiceError };

export async function updateRole(id: string, input: UpdateRoleInput): Promise<UpdateRoleResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("roles").update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.slug !== undefined && { slug: input.slug }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.color !== undefined && { color: input.color }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.displayOrder !== undefined && { display_order: input.displayOrder }),
      ...(input.isActive !== undefined && { is_active: input.isActive }),
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return { success: false, error: { message: error.message } };
    return { success: true };
  } catch { return { success: false, error: { message: "Couldn't update role." } }; }
}

export type DeleteRoleResult = { success: true } | { success: false; error: RoleServiceError };

export async function deleteRole(id: string): Promise<DeleteRoleResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    // Prevent deleting system roles
    const { data: role } = await supabase.from("roles").select("is_system").eq("id", id).single();
    if (role?.is_system) return { success: false, error: { message: "System roles cannot be deleted." } };
    const { error } = await supabase.from("roles").delete().eq("id", id);
    if (error) return { success: false, error: { message: error.message } };
    return { success: true };
  } catch { return { success: false, error: { message: "Couldn't delete role." } }; }
}

export async function duplicateRole(id: string, newName: string): Promise<CreateRoleResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: src } = await supabase.from("roles").select("*").eq("id", id).single();
    if (!src) return { success: false, error: { message: "Source role not found." } };
    return createRole({
      name: newName,
      slug: newName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description: `Copy of ${src.name}`,
      color: src.color, icon: src.icon,
      priority: src.priority + 1, displayOrder: src.display_order + 1,
    });
  } catch { return { success: false, error: { message: "Couldn't duplicate role." } }; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRole(r: any): Role {
  return {
    id: r.id, name: r.name, slug: r.slug, description: r.description,
    color: r.color, icon: r.icon, priority: r.priority,
    displayOrder: r.display_order, isSystem: r.is_system,
    isActive: r.is_active, createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
