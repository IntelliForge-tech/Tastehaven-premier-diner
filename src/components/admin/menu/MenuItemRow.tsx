import { Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/common/Button";
import type { MenuItemWithCategory } from "@/services/menu/menu.service";

interface MenuItemRowProps {
  item: MenuItemWithCategory;
  /** Phase 6C — navigates to /admin/menu/$menuId/edit. */
  onEdit: (item: MenuItemWithCategory) => void;
  /** Phase 6C — opens the delete confirmation dialog for this item. */
  onDelete: (item: MenuItemWithCategory) => void;
}

/** One row in the menu list, with Edit/Delete actions (Phase 6C). */
export function MenuItemRow({ item, onEdit, onDelete }: MenuItemRowProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-foreground">{item.name}</p>
          {item.isFeatured && (
            <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
              <Star className="size-3" aria-hidden="true" />
              Featured
            </Badge>
          )}
        </div>
        {item.categoryName && (
          <p className="mt-0.5 text-sm text-muted-foreground">{item.categoryName}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Badge variant={item.isAvailable ? "secondary" : "outline"}>
          {item.isAvailable ? "Available" : "Unavailable"}
        </Badge>
        <span className="font-display text-base font-semibold text-foreground">
          ${item.price.toFixed(2)}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
            className="inline-flex size-8 items-center justify-center p-0"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.name}`}
            className="inline-flex size-8 items-center justify-center p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
