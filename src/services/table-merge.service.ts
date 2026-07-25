import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type MergeErrorCode = "network_error" | "not_found" | "unexpected_error";

export interface MergeError {
  code: MergeErrorCode;
  message: string;
}

export interface MergeGroup {
  id: string;
  groupName: string;
  tableIds: string[];
  combinedCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export type GetMergeGroupsResult =
  | { success: true; data: MergeGroup[] }
  | { success: false; error: MergeError };

export async function getMergeGroups(): Promise<GetMergeGroupsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data: groups, error: gErr } = await supabase
      .from("table_merge_groups")
      .select("id, group_name, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (gErr) return { success: false, error: mapError(gErr, "load") };

    const { data: items, error: iErr } = await supabase
      .from("table_merge_items")
      .select("group_id, table_id");

    if (iErr) return { success: false, error: mapError(iErr, "load") };

    const groupMap = new Map<string, string[]>();
    for (const item of items) {
      const arr = groupMap.get(item.group_id) ?? [];
      arr.push(item.table_id);
      groupMap.set(item.group_id, arr);
    }

    return {
      success: true,
      data: groups.map((g) => ({
        id: g.id,
        groupName: g.group_name,
        tableIds: groupMap.get(g.id) ?? [],
        combinedCapacity: 0, // Caller computes from tables data
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      })),
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export interface CreateMergeGroupInput {
  groupName: string;
  tableIds: string[];
}

export type CreateMergeGroupResult =
  | { success: true; data: MergeGroup }
  | { success: false; error: MergeError };

export async function createMergeGroup(input: CreateMergeGroupInput): Promise<CreateMergeGroupResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data: group, error: gErr } = await supabase
      .from("table_merge_groups")
      .insert({ group_name: input.groupName })
      .select("id, group_name, created_at, updated_at")
      .single();

    if (gErr) return { success: false, error: mapError(gErr, "save") };

    const items = input.tableIds.map((tableId) => ({
      group_id: group.id,
      table_id: tableId,
    }));

    const { error: iErr } = await supabase.from("table_merge_items").insert(items);

    if (iErr) {
      // Best-effort cleanup
      await supabase.from("table_merge_groups").delete().eq("id", group.id);
      return { success: false, error: mapError(iErr, "save") };
    }

    return {
      success: true,
      data: {
        id: group.id,
        groupName: group.group_name,
        tableIds: input.tableIds,
        combinedCapacity: 0,
        createdAt: group.created_at,
        updatedAt: group.updated_at,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

export type DeleteMergeGroupResult =
  | { success: true }
  | { success: false; error: MergeError };

export async function deleteMergeGroup(groupId: string): Promise<DeleteMergeGroupResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    // Items deleted via CASCADE
    const { error } = await supabase.from("table_merge_groups").delete().eq("id", groupId);
    if (error) return { success: false, error: mapError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpected(err) };
  }
}

function mapError(e: PostgrestError, ctx: "load" | "save"): MergeError {
  console.error(`[table-merge.service] ${ctx}:`, e.message);
  return {
    code: "unexpected_error",
    message: ctx === "save"
      ? "We couldn't save the merge group. Please try again."
      : "We couldn't load merge groups. Please try again.",
  };
}

function mapUnexpected(err: unknown): MergeError {
  if (err instanceof TypeError) {
    return { code: "network_error", message: "We couldn't reach the server. Check your connection." };
  }
  return { code: "unexpected_error", message: "Something went wrong. Please try again." };
}
