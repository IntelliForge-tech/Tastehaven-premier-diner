import { CalendarClock, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/common/Button";
import type { OfferItem } from "@/services/offers.service";

interface OfferRowProps {
  item: OfferItem;
  /** Navigate to the edit page for this offer. */
  onEdit: (item: OfferItem) => void;
  /** Open the delete confirmation dialog for this offer. */
  onDelete: (item: OfferItem) => void;
}

/**
 * One row in the Special Offers listing — Phase 10C: Edit and Delete
 * buttons are now wired via callbacks instead of disabled.
 */
export function OfferRow({ item, onEdit, onDelete }: OfferRowProps) {
  const descriptionPreview =
    item.description && item.description.length > 100
      ? `${item.description.slice(0, 100).trimEnd()}…`
      : item.description;

  const formattedFrom = item.validFrom
    ? new Date(item.validFrom).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const formattedUntil = item.validUntil
    ? new Date(item.validUntil).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: icon + title + description + tag */}
      <div className="flex min-w-0 items-start gap-3">
        {/* Icon slot — shown only when the column is non-null */}
        {item.icon && (
          <div
            className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-lg"
            aria-hidden="true"
          >
            {item.icon}
          </div>
        )}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{item.title}</p>
            {item.tag && (
              <Badge variant="outline" className="border-primary/40 text-primary text-xs">
                {item.tag}
              </Badge>
            )}
          </div>

          {descriptionPreview && (
            <p className="mt-0.5 text-sm text-muted-foreground">{descriptionPreview}</p>
          )}

          {(formattedFrom || formattedUntil) && (
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="size-3" aria-hidden="true" />
              {formattedFrom && formattedUntil ? (
                <span>
                  {formattedFrom} – {formattedUntil}
                </span>
              ) : formattedFrom ? (
                <span>From {formattedFrom}</span>
              ) : (
                <span>Until {formattedUntil}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: order + status + actions */}
      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-nowrap">
        <span className="text-xs text-muted-foreground">#{item.displayOrder}</span>

        <Badge variant={item.isActive ? "secondary" : "outline"}>
          {item.isActive ? "Active" : "Inactive"}
        </Badge>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            aria-label={`Edit ${item.title}`}
            onClick={() => onEdit(item)}
            className="inline-flex size-8 items-center justify-center p-0"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label={`Delete ${item.title}`}
            onClick={() => onDelete(item)}
            className="inline-flex size-8 items-center justify-center p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
