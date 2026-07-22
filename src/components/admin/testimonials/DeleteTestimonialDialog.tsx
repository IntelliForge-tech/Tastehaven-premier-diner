import { Loader2, Star } from "lucide-react";
import type { MouseEvent } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteTestimonial } from "@/hooks/useDeleteTestimonial";
import type { TestimonialItem } from "@/services/testimonials.service";

interface DeleteTestimonialDialogProps {
  /** The testimonial pending deletion, or null when the dialog should be closed. */
  item: TestimonialItem | null;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete so the listing page can refetch. */
  onDeleted: () => void;
}

/**
 * Confirmation dialog for deleting a testimonial. Mirrors
 * DeleteGalleryImageDialog exactly, with one addition from the spec:
 * shows the customer's star rating alongside their name in the
 * description, so the admin can be confident they're deleting the right
 * entry when multiple customers share a name.
 */
export function DeleteTestimonialDialog({
  item,
  onOpenChange,
  onDeleted,
}: DeleteTestimonialDialogProps) {
  const { isDeleting, deleteItem } = useDeleteTestimonial();

  async function handleConfirm(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!item) return;

    const result = await deleteItem(item.id);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Testimonial deleted.");
    onDeleted();
    onOpenChange(false);
  }

  const stars = item ? Array.from({ length: 5 }, (_, i) => i < item.rating) : [];

  return (
    <AlertDialog open={item !== null} onOpenChange={(open) => !isDeleting && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              {item ? (
                <>
                  <span className="font-medium text-foreground">{item.customerName}</span>
                  <span className="ml-2 inline-flex items-center gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                    {stars.map((filled, i) => (
                      <Star
                        key={i}
                        className={
                          filled
                            ? "size-3 fill-primary text-primary"
                            : "size-3 text-muted-foreground/40"
                        }
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <span className="mt-2 block text-muted-foreground">
                    This testimonial will be permanently deleted. This action cannot be undone.
                  </span>
                </>
              ) : (
                "This action cannot be undone."
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            aria-busy={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Deleting…
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
