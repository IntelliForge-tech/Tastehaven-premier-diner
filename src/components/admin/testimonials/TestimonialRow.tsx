import { Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/common/Button";
import type { TestimonialItem } from "@/services/testimonials.service";

interface TestimonialRowProps {
  item: TestimonialItem;
  /** Phase 8C — navigates to /admin/testimonials/$testimonialId/edit. */
  onEdit: (item: TestimonialItem) => void;
  /** Phase 8C — opens the delete confirmation dialog. */
  onDelete: (item: TestimonialItem) => void;
}

/**
 * One row in the testimonials list. Edit/Delete are rendered disabled
 * to hold the layout for Phase 8B/8C rather than being left out and
 * having the layout shift when they're wired up — same pattern as
 * MenuItemRow before Phase 6C and GalleryCard before Phase 7C.
 *
 * No `photo_url` column exists on the `testimonials` table (confirmed
 * from database.types.ts), so the "photo" slot is an avatar initial
 * derived from `customer_name` — this matches the real schema rather
 * than inventing a field that doesn't exist, the same reasoning as
 * gallery.service.ts's use of `caption` as the card "title".
 */
export function TestimonialRow({ item, onEdit, onDelete }: TestimonialRowProps) {
  const initial = item.customerName.trim().charAt(0).toUpperCase() || "?";

  const stars = Array.from({ length: 5 }, (_, i) => i < item.rating);

  const previewLength = 120;
  const reviewPreview =
    item.reviewText.length > previewLength
      ? `${item.reviewText.slice(0, previewLength).trimEnd()}…`
      : item.reviewText;

  const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-4 border-b border-border py-4 last:border-b-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {/* Avatar initial — no photo_url column on the testimonials table */}
        <div
          className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-semibold text-primary"
          aria-hidden="true"
        >
          {initial}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium text-foreground">{item.customerName}</p>
            {item.isFeatured && (
              <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
                <Star className="size-3" aria-hidden="true" />
                Featured
              </Badge>
            )}
          </div>

          {item.roleOrLocation && (
            <p className="mt-0.5 text-sm text-muted-foreground">{item.roleOrLocation}</p>
          )}

          {/* Star rating */}
          <div
            className="mt-1 flex items-center gap-0.5"
            aria-label={`Rating: ${item.rating} out of 5`}
          >
            {stars.map((filled, i) => (
              <Star
                key={i}
                className={
                  filled
                    ? "size-3.5 fill-primary text-primary"
                    : "size-3.5 text-muted-foreground/40"
                }
                aria-hidden="true"
              />
            ))}
          </div>

          <p className="mt-1.5 text-sm text-muted-foreground">{reviewPreview}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:flex-nowrap">
        <span className="text-xs text-muted-foreground">#{item.displayOrder}</span>
        <Badge variant={item.isVisible ? "secondary" : "outline"}>
          {item.isVisible ? "Visible" : "Hidden"}
        </Badge>
        <span className="text-xs text-muted-foreground">{formattedDate}</span>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.customerName}`}
            className="inline-flex size-8 items-center justify-center p-0"
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onDelete(item)}
            aria-label={`Delete ${item.customerName}`}
            className="inline-flex size-8 items-center justify-center p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
