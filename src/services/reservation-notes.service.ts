import type { PostgrestError } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface ReservationNote {
  id: string;
  reservationId: string;
  note: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationNoteError {
  message: string;
}

export type GetNotesResult =
  | { success: true; data: ReservationNote[] }
  | { success: false; error: ReservationNoteError };

export async function getReservationNotes(reservationId: string): Promise<GetNotesResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("reservation_notes")
      .select("*")
      .eq("reservation_id", reservationId)
      .order("created_at", { ascending: false });

    if (error) return { success: false, error: mapErr(error) };
    return { success: true, data: (data ?? []).map(mapRow) };
  } catch (err) {
    return { success: false, error: { message: "Couldn't load notes." } };
  }
}

export type CreateNoteResult =
  | { success: true; data: ReservationNote }
  | { success: false; error: ReservationNoteError };

export async function createReservationNote(
  reservationId: string,
  note: string,
  createdBy: string,
): Promise<CreateNoteResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("reservation_notes")
      .insert({ reservation_id: reservationId, note, created_by: createdBy })
      .select()
      .single();

    if (error) return { success: false, error: mapErr(error) };
    return { success: true, data: mapRow(data) };
  } catch {
    return { success: false, error: { message: "Couldn't save note." } };
  }
}

export type DeleteNoteResult =
  | { success: true }
  | { success: false; error: ReservationNoteError };

export async function deleteReservationNote(id: string): Promise<DeleteNoteResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("reservation_notes").delete().eq("id", id);
    if (error) return { success: false, error: mapErr(error) };
    return { success: true };
  } catch {
    return { success: false, error: { message: "Couldn't delete note." } };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): ReservationNote {
  return {
    id: row.id,
    reservationId: row.reservation_id,
    note: row.note,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapErr(error: PostgrestError): ReservationNoteError {
  console.error("[reservation-notes.service]", error.message);
  return { message: "Something went wrong with reservation notes." };
}
