import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import {
  createCustomerNote,
  deleteCustomerNote,
} from "@/services/customer-notes.service";
import { useCustomerNotes } from "@/hooks/useCustomerHooks";

interface CustomerNotesCardProps {
  customerId: string;
  adminUserId: string | null;
}

export function CustomerNotesCard({ customerId, adminUserId }: CustomerNotesCardProps) {
  const { notes, isLoading, refetch } = useCustomerNotes(customerId);
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAddNote() {
    const trimmed = newNote.trim();
    if (!trimmed) return;
    setIsSaving(true);
    const result = await createCustomerNote(customerId, trimmed, adminUserId);
    setIsSaving(false);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    setNewNote("");
    toast.success("Note added.");
    refetch();
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    const result = await deleteCustomerNote(noteId);
    setDeletingId(null);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    toast.success("Note deleted.");
    refetch();
  }

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Staff Notes</h3>

      {/* Add new note */}
      <div className="mb-4 flex gap-2">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a private note…"
          rows={2}
          className="flex-1 resize-none rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isSaving}
        />
        <Button
          type="button"
          variant="gold"
          onClick={handleAddNote}
          disabled={isSaving || !newNote.trim()}
          className="inline-flex h-auto items-center gap-1.5 self-start px-3 py-2"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Plus className="size-4" aria-hidden="true" />
          )}
          Add
        </Button>
      </div>

      {/* Notes list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3"
            >
              <div className="flex-1">
                <p className="text-sm text-foreground">{note.note}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(note.id)}
                disabled={deletingId === note.id}
                aria-label="Delete note"
                className="mt-0.5 text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                {deletingId === note.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
