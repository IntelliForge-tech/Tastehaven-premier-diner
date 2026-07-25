import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type TablesServiceErrorCode = "network_error" | "not_found" | "unexpected_error";

export interface TablesServiceError {
  code: TablesServiceErrorCode;
  message: string;
}

export type TableShape = "square" | "rectangle" | "circle" | "oval" | "booth" | "custom";

export type TableStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "disabled"
  | "merge_pending";

export interface RestaurantTable {
  id: string;
  floorId: string;
  tableNumber: string;
  tableName: string | null;
  capacity: number;
  minGuests: number | null;
  maxGuests: number | null;
  shape: TableShape;
  status: TableStatus;
  positionX: number;
  positionY: number;
  rotation: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GetTablesResult =
  | { success: true; data: RestaurantTable[] }
  | { success: false; error: TablesServiceError };

export async function getTables(floorId?: string): Promise<GetTablesResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("restaurant_tables")
      .select("id, floor_id, table_number, table_name, capacity, min_guests, max_guests, shape, status, position_x, position_y, rotation, notes, is_active, created_at, updated_at")
      .order("table_number", { ascending: true });

    if (floorId) query = query.eq("floor_id", floorId);

    const { data, error } = await query;
    if (error) return { success: false, error: mapError(error, "load") };

    return {
      success: true,
      data: data.map(mapRow),
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export interface CreateTableInput {
  floorId: string;
  tableNumber: string;
  tableName: string | null;
  capacity: number;
  minGuests: number | null;
  maxGuests: number | null;
  shape: TableShape;
  positionX: number;
  positionY: number;
  rotation: number;
  notes: string | null;
  isActive: boolean;
}

export type CreateTableResult =
  | { success: true; data: RestaurantTable }
  | { success: false; error: TablesServiceError };

export async function createTable(input: CreateTableInput): Promise<CreateTableResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("restaurant_tables")
      .insert({
        floor_id: input.floorId,
        table_number: input.tableNumber,
        table_name: input.tableName,
        capacity: input.capacity,
        min_guests: input.minGuests,
        max_guests: input.maxGuests,
        shape: input.shape,
        status: "available",
        position_x: input.positionX,
        position_y: input.positionY,
        rotation: input.rotation,
        notes: input.notes,
        is_active: input.isActive,
      })
      .select("id, floor_id, table_number, table_name, capacity, min_guests, max_guests, shape, status, position_x, position_y, rotation, notes, is_active, created_at, updated_at")
      .single();

    if (error) return { success: false, error: mapError(error, "save") };
    return { success: true, data: mapRow(data) };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export interface UpdateTableInput {
  id: string;
  floorId: string;
  tableNumber: string;
  tableName: string | null;
  capacity: number;
  minGuests: number | null;
  maxGuests: number | null;
  shape: TableShape;
  positionX: number;
  positionY: number;
  rotation: number;
  notes: string | null;
  isActive: boolean;
}

export type UpdateTableResult =
  | { success: true }
  | { success: false; error: TablesServiceError };

export async function updateTable(input: UpdateTableInput): Promise<UpdateTableResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("restaurant_tables")
      .update({
        floor_id: input.floorId,
        table_number: input.tableNumber,
        table_name: input.tableName,
        capacity: input.capacity,
        min_guests: input.minGuests,
        max_guests: input.maxGuests,
        shape: input.shape,
        position_x: input.positionX,
        position_y: input.positionY,
        rotation: input.rotation,
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

export async function updateTableStatus(
  id: string,
  status: TableStatus,
): Promise<UpdateTableResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("restaurant_tables")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: mapError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export async function updateTablePosition(
  id: string,
  positionX: number,
  positionY: number,
  rotation: number,
): Promise<UpdateTableResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("restaurant_tables")
      .update({ position_x: positionX, position_y: positionY, rotation, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { success: false, error: mapError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export type DeleteTableResult =
  | { success: true }
  | { success: false; error: TablesServiceError };

export async function deleteTable(id: string): Promise<DeleteTableResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("restaurant_tables").delete().eq("id", id);
    if (error) return { success: false, error: mapError(error, "delete") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

type TableRow = {
  id: string;
  floor_id: string;
  table_number: string;
  table_name: string | null;
  capacity: number;
  min_guests: number | null;
  max_guests: number | null;
  shape: string;
  status: string;
  position_x: number;
  position_y: number;
  rotation: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function mapRow(r: TableRow): RestaurantTable {
  return {
    id: r.id,
    floorId: r.floor_id,
    tableNumber: r.table_number,
    tableName: r.table_name,
    capacity: r.capacity,
    minGuests: r.min_guests,
    maxGuests: r.max_guests,
    shape: r.shape as TableShape,
    status: r.status as TableStatus,
    positionX: r.position_x,
    positionY: r.position_y,
    rotation: r.rotation,
    notes: r.notes,
    isActive: r.is_active,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapError(e: PostgrestError, ctx: "load" | "save" | "delete"): TablesServiceError {
  console.error(`[tables.service] ${ctx}:`, e.message);
  return {
    code: "unexpected_error",
    message:
      ctx === "save" ? "We couldn't save that table. Please try again."
      : ctx === "delete" ? "We couldn't delete that table. Please try again."
      : "We couldn't load tables right now. Please try again.",
  };
}

function mapUnexpected(err: unknown): TablesServiceError {
  if (err instanceof TypeError) {
    return { code: "network_error", message: "We couldn't reach the server. Check your connection." };
  }
  return { code: "unexpected_error", message: "Something went wrong. Please try again." };
}
