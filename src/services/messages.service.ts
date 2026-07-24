import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Contact Messages service.
 *
 * Handles the contact_messages table — messages submitted by site visitors
 * through the public contact form. The admin can read and mark them as
 * read, but cannot edit or delete them (this is an inbox, not a CMS).
 *
 * Phase: Messages module.
 */

export type MessagesServiceErrorCode =
  | "network_error"
  | "not_found"
  | "unexpected_error";

export interface MessagesServiceError {
  code: MessagesServiceErrorCode;
  message: string;
}

export type MessageStatus = "unread" | "read" | "archived";

export interface ContactMessage {
  id: string;
  senderName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  body: string;
  status: MessageStatus;
  submittedAt: string;
}

export type GetMessagesResult =
  | { success: true; data: ContactMessage[] }
  | { success: false; error: MessagesServiceError };

export async function getMessages(): Promise<GetMessagesResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, sender_name, email, phone, subject, body, status, submitted_at")
      .order("submitted_at", { ascending: false });

    if (error) return { success: false, error: mapPostgrestError(error, "load") };

    return {
      success: true,
      data: data.map((row) => ({
        id: row.id,
        senderName: row.sender_name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        body: row.body,
        status: (row.status as MessageStatus) ?? "unread",
        submittedAt: row.submitted_at,
      })),
    };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

export type UpdateMessageStatusResult =
  | { success: true }
  | { success: false; error: MessagesServiceError };

export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<UpdateMessageStatusResult> {
  try {
    const supabase = getSupabaseBrowserClient();

    const { error } = await supabase
      .from("contact_messages")
      .update({ status })
      .eq("id", id);

    if (error) return { success: false, error: mapPostgrestError(error, "update") };
    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

// ── Private helpers ──────────────────────────────────────────────────────────

function mapPostgrestError(
  error: PostgrestError,
  context: "load" | "update",
): MessagesServiceError {
  console.error(`[messages.service] ${context} failed:`, error.message);
  return {
    code: "unexpected_error",
    message:
      context === "update"
        ? "We couldn't update that message. Please try again."
        : "We couldn't load messages right now. Please try again.",
  };
}

function mapUnexpectedError(err: unknown): MessagesServiceError {
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }
  return {
    code: "unexpected_error",
    message: "Something went wrong. Please try again.",
  };
}
