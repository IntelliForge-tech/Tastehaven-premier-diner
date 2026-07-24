import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type FaqServiceErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface FaqServiceError {
  code: FaqServiceErrorCode;
  message: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export type GetFaqsResult =
  | { success: true; data: FaqItem[] }
  | { success: false; error: FaqServiceError };

export async function getFaqs(): Promise<GetFaqsResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, display_order, is_active, created_at")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return { success: false, error: mapPostgrestError(error, "load") };

    return {
      success: true,
      data: data.map((row) => ({
        id: row.id,
        question: row.question,
        answer: row.answer,
        displayOrder: row.display_order,
        isActive: row.is_active,
        createdAt: row.created_at,
      })),
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "load") };
  }
}

export interface CreateFaqInput {
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
}

export type CreateFaqResult =
  | { success: true; data: FaqItem }
  | { success: false; error: FaqServiceError };

export async function createFaq(input: CreateFaqInput): Promise<CreateFaqResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("faqs")
      .insert({
        question: input.question,
        answer: input.answer,
        is_active: input.isActive,
        display_order: input.displayOrder,
      })
      .select("id, question, answer, display_order, is_active, created_at")
      .single();

    if (error) return { success: false, error: mapPostgrestError(error, "save") };

    return {
      success: true,
      data: {
        id: data.id,
        question: data.question,
        answer: data.answer,
        displayOrder: data.display_order,
        isActive: data.is_active,
        createdAt: data.created_at,
      },
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

export interface UpdateFaqInput {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
}

export type UpdateFaqResult =
  | { success: true }
  | { success: false; error: FaqServiceError };

export async function updateFaq(input: UpdateFaqInput): Promise<UpdateFaqResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("faqs")
      .update({
        question: input.question,
        answer: input.answer,
        is_active: input.isActive,
        display_order: input.displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.id);

    if (error) return { success: false, error: mapPostgrestError(error, "save") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "save") };
  }
}

export type DeleteFaqResult =
  | { success: true }
  | { success: false; error: FaqServiceError };

export async function deleteFaq(id: string): Promise<DeleteFaqResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) return { success: false, error: mapPostgrestError(error, "delete") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err, "delete") };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "save" | "delete",
): FaqServiceError {
  console.error(`[faq.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "We couldn't save that FAQ. Please try again."
        : context === "delete"
          ? "We couldn't delete that FAQ. Please try again."
          : "We couldn't load FAQs right now. Please try again.",
  };
}

function mapUnexpectedError(
  err: unknown,
  context: "load" | "save" | "delete",
): FaqServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message:
      context === "save"
        ? "Something went wrong saving that FAQ. Please try again."
        : context === "delete"
          ? "Something went wrong deleting that FAQ. Please try again."
          : "Something went wrong loading FAQs. Please try again.",
  };
}
