import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type FloorsServiceErrorCode = "network_error" | "not_found" | "unexpected_error";

export interface FloorsServiceError {
  code: FloorsServiceErrorCode;
  message: string;
}

export interface Floor {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  maxCapacity: number | null;
  backgroundImage: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GetFloorsResult =
  | { success: true; data: Floor[] }
  | { success: false; error: FloorsServiceError };

export async function getFloors(): Promise<GetFloorsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("floors")
      .select("id, name, description, display_order, max_capacity, background_image, is_active, created_at, updated_at")
      .order("display_order", { ascending: true });

    if (error) return { success: false, error: mapError(error, "load") };

    return {
      success: true,
      data: data.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        displayOrder: r.display_order,
        maxCapacity: r.max_capacity,
        backgroundImage: r.background_image,
        isActive: r.is_active,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })),
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export interface CreateFloorInput {
  name: string;
  description: string | null;
  displayOrder: number;
  maxCapacity: number | null;
  isActive: boolean;
}

export type CreateFloorResult =
  | { success: true; data: Floor }
  | { success: false; error: FloorsServiceError };

export async function createFloor(input: CreateFloorInput): Promise<CreateFloorResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("floors")
      .insert({
        name: input.name,
        description: input.description,
        display_order: input.displayOrder,
        max_capacity: input.maxCapacity,
        is_active: input.isActive,
      })
      .select("id, name, description, display_order, max_capacity, background_image, is_active, created_at, updated_at")
      .single();

    if (error) return { success: false, error: mapError(error, "save") };

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        displayOrder: data.display_order,
        maxCapacity: data.max_capacity,
        backgroundImage: data.background_image,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export interface UpdateFloorInput {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  maxCapacity: number | null;
  isActive: boolean;
}

export type UpdateFloorResult =
  | { success: true }
  | { success: false; error: FloorsServiceError };

export async function updateFloor(input: UpdateFloorInput): Promise<UpdateFloorResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("floors")
      .update({
        name: input.name,
        description: input.description,
        display_order: input.displayOrder,
        max_capacity: input.maxCapacity,
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

export type DeleteFloorResult =
  | { success: true }
  | { success: false; error: FloorsServiceError };

export async function deleteFloor(id: string): Promise<DeleteFloorResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("floors").delete().eq("id", id);
    if (error) return { success: false, error: mapError(error, "delete") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

function mapError(e: PostgrestError, ctx: "load" | "save" | "delete"): FloorsServiceError {
  console.error(`[floors.service] ${ctx}:`, e.message);
  return {
    code: "unexpected_error",
    message:
      ctx === "save" ? "We couldn't save that floor. Please try again."
      : ctx === "delete" ? "We couldn't delete that floor. Please try again."
      : "We couldn't load floors right now. Please try again.",
  };
}

function mapUnexpected(err: unknown): FloorsServiceError {
  if (err instanceof TypeError) {
    return { code: "network_error", message: "We couldn't reach the server. Check your connection." };
  }
  return { code: "unexpected_error", message: "Something went wrong. Please try again." };
}
