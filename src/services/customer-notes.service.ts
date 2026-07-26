import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CustomerServiceError } from "@/services/customers.service";

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type GetCustomerNotesResult =
  | { success: true; data: CustomerNote[] }
  | { success: false; error: CustomerServiceError };

export type CreateCustomerNoteResult =
  | { success: true; data: CustomerNote }
  | { success: false; error: CustomerServiceError };

export type DeleteCustomerNoteResult =
  | { success: true }
  | { success: false; error: CustomerServiceError };

export async function getCustomerNotes(
  customerId: string,
): Promise<GetCustomerNotesResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("customer_notes")
      .select("id, customer_id, note, created_by, created_at, updated_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: mapErr(error, "load") };
    }

    return {
      success: true,
      data: data.map((row) => ({
        id: row.id,
        customerId: row.customer_id,
        note: row.note,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    };
  } catch (err) {
    return { success: false, error: unexpectedErr(err, "load") };
  }
}

export async function createCustomerNote(
  customerId: string,
  note: string,
  createdBy: string | null,
): Promise<CreateCustomerNoteResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("customer_notes")
      .insert({ customer_id: customerId, note, created_by: createdBy })
      .select("id, customer_id, note, created_by, created_at, updated_at")
      .single();

    if (error) {
      return { success: false, error: mapErr(error, "save") };
    }

    return {
      success: true,
      data: {
        id: data.id,
        customerId: data.customer_id,
        note: data.note,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (err) {
    return { success: false, error: unexpectedErr(err, "save") };
  }
}

export async function deleteCustomerNote(
  noteId: string,
): Promise<DeleteCustomerNoteResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from("customer_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      return { success: false, error: mapErr(error, "delete") };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: unexpectedErr(err, "delete") };
  }
}

function mapErr(
  error: PostgrestError,
  ctx: "load" | "save" | "delete",
): CustomerServiceError {
  console.error(`[customer-notes.service] ${ctx}:`, error.message);
  return {
    code: "unexpected_error",
    message:
      ctx === "save"
        ? "We couldn't save that note. Please try again."
        : ctx === "delete"
          ? "We couldn't delete that note. Please try again."
          : "We couldn't load notes right now. Please try again.",
  };
}

function unexpectedErr(
  err: unknown,
  ctx: "load" | "save" | "delete",
): CustomerServiceError {
  if (err instanceof TypeError)
    return { code: "network_error", message: "Network error. Please try again." };
  return {
    code: "unexpected_error",
    message: `Something went wrong ${ctx === "save" ? "saving" : ctx === "delete" ? "deleting" : "loading"} the note.`,
  };
}
