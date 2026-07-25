import { useCallback, useEffect, useRef, useState } from "react";

import {
  createReservationNote,
  deleteReservationNote,
  getReservationNotes,
  type ReservationNote,
} from "@/services/reservation-notes.service";

// ── Read ──────────────────────────────────────────────────────────────────────

export function useReservationNotes(reservationId: string) {
  const [notes, setNotes] = useState<ReservationNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    getReservationNotes(reservationId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setNotes(result.data);
      } else {
        setError(result.error.message);
      }
      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [reservationId, reloadToken]);

  const refetch = useCallback(() => setReloadToken((t) => t + 1), []);

  return { notes, isLoading, error, refetch };
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateReservationNote(reservationId: string, createdBy: string) {
  const [isCreating, setIsCreating] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function createNote(note: string) {
    setIsCreating(true);
    try {
      return await createReservationNote(reservationId, note, createdBy);
    } finally {
      if (isMountedRef.current) setIsCreating(false);
    }
  }

  return { createNote, isCreating };
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteReservationNote() {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isMountedRef = useRef(true);
  useEffect(() => () => { isMountedRef.current = false; }, []);

  async function deleteNote(id: string) {
    setDeletingId(id);
    try {
      return await deleteReservationNote(id);
    } finally {
      if (isMountedRef.current) setDeletingId(null);
    }
  }

  return { deleteNote, deletingId, isDeleting: deletingId !== null };
}
