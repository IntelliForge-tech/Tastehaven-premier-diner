import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { SortableGalleryCard } from "@/components/admin/gallery/SortableGalleryCard";
import type { GalleryImageItem } from "@/services/gallery.service";

interface GalleryGridProps {
  items: GalleryImageItem[];
  onEdit: (item: GalleryImageItem) => void;
  onDelete: (item: GalleryImageItem) => void;
  /** Phase 7D — called with the full list in its new order on drop. */
  onReorder: (newOrder: GalleryImageItem[]) => void;
  /** Disables further drags while a previous reorder is still saving. */
  isReordering: boolean;
}

/**
 * Responsive grid of gallery images — 1 column on mobile, up to 4 at xl
 * — now with drag-and-drop reordering (Phase 7D) via @dnd-kit.
 *
 * `rectSortingStrategy` (not the default `verticalListSortingStrategy`)
 * because this is a multi-column grid, not a single vertical list — it
 * accounts for items moving between rows/columns as they're dragged.
 *
 * `PointerSensor` with a small `activationConstraint.distance` so a
 * plain click on a card (or its Edit/Delete buttons) never gets
 * misread as a drag; `KeyboardSensor` with `sortableKeyboardCoordinates`
 * gives the grip handle full keyboard support (Tab to it, Space/Enter
 * to pick up, arrow keys to move, Space/Enter to drop, Escape to
 * cancel) — this is what satisfies this phase's keyboard-accessibility
 * requirement, not anything custom built here. `touch-none` on the grip
 * handle itself (see SortableGalleryCard) is what makes dragging work
 * on touch devices, since PointerSensor covers touch input too.
 *
 * This component only reports *that* a drop happened and the resulting
 * order — it doesn't touch Supabase or decide what "saving" means; that
 * all lives in useReorderGallery (the hook the page passes onReorder/
 * isReordering down from).
 */
export function GalleryGrid({ items, onEdit, onDelete, onReorder, isReordering }: GalleryGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <SortableGalleryCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={isReordering}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
