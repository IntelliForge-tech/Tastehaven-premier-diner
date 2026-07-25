import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateReservationNote,
  useDeleteReservationNote,
  useReservationNotes,
} from "@/hooks/useReservationNotes";

interface ReservationNotesCardProps {
  reservationId: string;
  /** Admin user ID for created_by column. */
  adminUserId: string;
}

export function ReservationNotesCard({
  reservationId,
  adminUserId,
}: ReservationNotesCardProps) {
  const { notes, isLoading, refetch } = useReservationNotes(reservationId);
  const { createNote, isCreating } = useCreateReservationNote(reservationId, adminUserId);
  const { deleteNote, deletingId } = useDeleteReservationNote();
  const [draft, setDraft] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function handleCreate() {
    if (!draft.trim()) return;
    const result = await createNote(draft.trim());
    if (!result.success) {
      toast.error(result.error.message);
    } else {
      setDraft("");
      setShowForm(false);
      refetch();
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this note?")) return;
    const result = await deleteNote(id);
    if (!result.success) {
      toast.error(result.error.message);
    } else {
      toast.success("Note deleted.");
      refetch();
    }
  }

  return (
    <div className="space-y-3">
      {isLoading ? (
        <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Loading notes…
        </div>
      ) : notes.length === 0 && !showForm ? (
        <p className="py-3 text-sm text-muted-foreground">No staff notes yet.</p>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div
              key={note.id}
              className="group flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                disabled={deletingId === note.id}
                className="mt-0.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                aria-label="Delete note"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a private staff note…"
            rows={3}
            maxLength={1000}
            className="text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline-gold"
              onClick={() => { setShowForm(false); setDraft(""); }}
              className="h-7 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="gold"
              disabled={!draft.trim() || isCreating}
              onClick={handleCreate}
              className="h-7 gap-1.5 px-3 text-xs"
            >
              {isCreating && <Loader2 className="size-3 animate-spin" />}
              Save Note
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline-gold"
          onClick={() => setShowForm(true)}
          className="h-7 gap-1.5 px-3 text-xs"
        >
          <Plus className="size-3" />
          Add Note
        </Button>
      )}
    </div>
  );
}
