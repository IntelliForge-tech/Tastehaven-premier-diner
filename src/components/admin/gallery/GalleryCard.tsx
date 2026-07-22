import { Pencil, Star, Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/common/Button";
import { Badge } from "@/components/ui/badge";
import type { GalleryImageItem } from "@/services/gallery.service";

interface GalleryCardProps {
  item: GalleryImageItem;
  onEdit: (item: GalleryImageItem) => void;
  onDelete: (item: GalleryImageItem) => void;
  /**
   * Phase 7D — a small grip handle rendered in the corner, wired to
   * @dnd-kit's drag listeners by SortableGalleryCard. Optional and only
   * rendered when provided, so this component's own behavior/markup is
   * unchanged for any usage that doesn't pass one.
   */
  dragHandleProps?: ReactNode;
}

/**
 * One card in the gallery grid. Edit/Delete were rendered disabled in
 * Phase 7A/7B to hold this exact layout; Phase 7C wires them to real
 * callbacks (navigate to the edit route / open the delete confirmation
 * dialog), same division of responsibility as MenuItemRow's onEdit/
 * onDelete — this component only renders and calls back, the listing
 * page owns what those actions actually do.
 */
export function GalleryCard({ item, onEdit, onDelete, dragHandleProps }: GalleryCardProps) {
  const title = item.caption ?? "Untitled";

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      {dragHandleProps}

      <div className="aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img src={item.imageUrl} alt={item.altText} className="size-full object-cover" />
      </div>

      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-medium text-foreground">{title}</p>
          {item.isFeatured && (
            <Badge variant="outline" className="shrink-0 gap-1 border-primary/40 text-primary">
              <Star className="size-3" aria-hidden="true" />
              Featured
            </Badge>
          )}
        </div>

        {item.categoryName && <p className="text-sm text-muted-foreground">{item.categoryName}</p>}

        <p className="truncate text-xs text-muted-foreground">Alt text: {item.altText}</p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Order: {item.displayOrder}</span>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${title}`}
              className="inline-flex size-8 items-center justify-center p-0"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onDelete(item)}
              aria-label={`Delete ${title}`}
              className="inline-flex size-8 items-center justify-center p-0 text-destructive"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
