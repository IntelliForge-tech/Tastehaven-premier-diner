import { Loader2 } from "lucide-react";
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
import { useDeleteOffer } from "@/hooks/useDeleteOffer";
import type { OfferItem } from "@/services/offers.service";

interface DeleteOfferDialogProps {
  /** The offer pending deletion, or null when the dialog is closed. */
  offer: OfferItem | null;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete so the listing page can refetch. */
  onDeleted: () => void;
}

/**
 * Confirmation dialog for deleting an offer. Shows the offer's title
 * and tag (if present) so the admin is unambiguous about what they're
 * about to delete. Same AlertDialog + prevent-default-to-hold-open
 * pattern as DeleteChefDialog and DeleteGalleryImageDialog.
 *
 * No Storage cleanup needed (special_offers has no image_url column).
 */
export function DeleteOfferDialog({
  offer,
  onOpenChange,
  onDeleted,
}: DeleteOfferDialogProps) {
  const { deleteItem, isDeleting } = useDeleteOffer();

  async function handleConfirm(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (!offer) return;

    const result = await deleteItem(offer.id);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Offer deleted.");
    onDeleted();
    onOpenChange(false);
  }

  return (
    <AlertDialog open={offer !== null} onOpenChange={(open) => !isDeleting && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this offer?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="font-medium text-foreground">{offer?.title}</strong>
            {offer?.tag ? (
              <> &mdash; {offer.tag}</>
            ) : null}{" "}
            will be permanently removed. This action cannot be undone.
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
