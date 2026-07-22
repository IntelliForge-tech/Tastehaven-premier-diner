import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { GalleryCard } from "@/components/admin/gallery/GalleryCard";
import type { GalleryImageItem } from "@/services/gallery.service";

interface SortableGalleryCardProps {
  item: GalleryImageItem;
  onEdit: (item: GalleryImageItem) => void;
  onDelete: (item: GalleryImageItem) => void;
  /** Disables dragging while a previous reorder is still saving, so drags can't overlap. */
  disabled?: boolean;
}

/**
 * Makes one GalleryCard draggable/sortable via @dnd-kit, without giving
 * GalleryCard itself any drag-and-drop awareness — it just renders
 * whatever `dragHandleProps` it's given.
 *
 * The grip handle (not the whole card) carries @dnd-kit's
 * attributes/listeners, so Edit/Delete stay ordinary clickable buttons
 * instead of fighting a card-wide drag listener. @dnd-kit's
 * `attributes` already includes `role="button"`, `tabIndex`,
 * `aria-describedby`, and keyboard (`Enter`/`Space` to pick up,
 * arrow keys to move, `Escape` to cancel) handling — that's what makes
 * this keyboard-accessible without anything extra here.
 */
export function SortableGalleryCard({ item, onEdit, onDelete, disabled }: SortableGalleryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "z-10 opacity-70" : undefined}
    >
      <GalleryCard
        item={item}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label={`Reorder ${item.caption ?? "this image"}`}
            disabled={disabled}
            className="absolute left-2 top-2 z-10 grid size-7 touch-none place-items-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm cursor-grab active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          >
            <GripVertical className="size-4" aria-hidden="true" />
          </button>
        }
      />
    </div>
  );
}
