import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CustomerServiceError } from "@/services/customers.service";

export interface CustomerTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CustomerTagAssignment {
  id: string;
  customerId: string;
  tagId: string;
  tag: CustomerTag;
}

export type GetTagsResult =
  | { success: true; data: CustomerTag[] }
  | { success: false; error: CustomerServiceError };

export type GetCustomerTagsResult =
  | { success: true; data: CustomerTagAssignment[] }
  | { success: false; error: CustomerServiceError };

export type CreateTagResult =
  | { success: true; data: CustomerTag }
  | { success: false; error: CustomerServiceError };

export type AssignTagResult =
  | { success: true }
  | { success: false; error: CustomerServiceError };

export type RemoveTagResult =
  | { success: true }
  | { success: false; error: CustomerServiceError };

export async function getAllTags(): Promise<GetTagsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("customer_tags")
      .select("id, name, color, created_at")
      .order("name", { ascending: true });

    if (error) return { success: false, error: mapErr(error, "load") };

    return {
      success: true,
      data: data.map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color ?? "#6b7280",
        createdAt: r.created_at,
      })),
    };
  } catch (err) {
    return { success: false, error: unexpectedErr(err) };
  }
}

export async function getCustomerTags(
  customerId: string,
): Promise<GetCustomerTagsResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("customer_tag_assignments")
      .select("id, customer_id, tag_id, customer_tags(id, name, color, created_at)")
      .eq("customer_id", customerId);

    if (error) return { success: false, error: mapErr(error, "load") };

    return {
      success: true,
      data: data.map((r) => {
        const tag = Array.isArray(r.customer_tags)
          ? r.customer_tags[0]
          : r.customer_tags;
        return {
          id: r.id,
          customerId: r.customer_id,
          tagId: r.tag_id,
          tag: {
            id: tag?.id ?? r.tag_id,
            name: tag?.name ?? "",
            color: tag?.color ?? "#6b7280",
            createdAt: tag?.created_at ?? "",
          },
        };
      }),
    };
  } catch (err) {
    return { success: false, error: unexpectedErr(err) };
  }
}

export async function createTag(
  name: string,
  color: string,
): Promise<CreateTagResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("customer_tags")
      .insert({ name, color })
      .select("id, name, color, created_at")
      .single();

    if (error) return { success: false, error: mapErr(error, "save") };

    return {
      success: true,
      data: { id: data.id, name: data.name, color: data.color, createdAt: data.created_at },
    };
  } catch (err) {
    return { success: false, error: unexpectedErr(err) };
  }
}

export async function assignTagToCustomer(
  customerId: string,
  tagId: string,
): Promise<AssignTagResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("customer_tag_assignments")
      .upsert({ customer_id: customerId, tag_id: tagId }, { onConflict: "customer_id,tag_id" });

    if (error) return { success: false, error: mapErr(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: unexpectedErr(err) };
  }
}

export async function removeTagFromCustomer(
  customerId: string,
  tagId: string,
): Promise<RemoveTagResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("customer_tag_assignments")
      .delete()
      .eq("customer_id", customerId)
      .eq("tag_id", tagId);

    if (error) return { success: false, error: mapErr(error, "delete") };
    return { success: true };
  } catch (err) {
    return { success: false, error: unexpectedErr(err) };
  }
}

function mapErr(err: PostgrestError, ctx: string): CustomerServiceError {
  console.error(`[customer-tags.service] ${ctx}:`, err.message);
  return { code: "unexpected_error", message: "We couldn't process that tag action. Please try again." };
}

function unexpectedErr(err: unknown): CustomerServiceError {
  if (err instanceof TypeError)
    return { code: "network_error", message: "Network error. Please try again." };
  return { code: "unexpected_error", message: "Something went wrong. Please try again." };
}

/** Preset tag colors. */
export const TAG_COLORS = [
  "#D4AF37", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
  "#6B7280", "#1E293B",
];

/** Well-known tag names for quick-add. */
export const PRESET_TAGS = [
  { name: "VIP", color: "#D4AF37" },
  { name: "Regular", color: "#3B82F6" },
  { name: "First Time", color: "#22C55E" },
  { name: "Birthday Guest", color: "#EC4899" },
  { name: "Anniversary", color: "#8B5CF6" },
  { name: "Corporate", color: "#1E293B" },
  { name: "High Spender", color: "#EF4444" },
  { name: "Inactive", color: "#6B7280" },
];
