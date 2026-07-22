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
import { useDeleteGalleryItem } from "@/hooks/useDeleteGalleryItem";
import type { GalleryImageItem } from "@/services/gallery.service";

interface DeleteGalleryImageDialogProps {
  /** The image pending deletion, or null when the dialog should be closed. */
  item: GalleryImageItem | null;
  /** Called on cancel, and after a successful delete. */
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete, so the caller can refetch the list. */
  onDeleted: () => void;
}

/**
 * Confirmation dialog for deleting a gallery image, mirroring
 * DeleteMenuItemDialog.tsx exactly (same AlertDialog primitive, same
 * "prevent default so it stays open with a loading state" handling).
 * Shows the image's caption in the confirmation message when one
 * exists — falls back to generic wording when it doesn't, since
 * `caption` is optional on `gallery_images` (unlike `menu_items.name`,
 * which Menu's version can always show).
 */
export function DeleteGalleryImageDialog({
  item,
  onOpenChange,
  onDeleted,
}: DeleteGalleryImageDialogProps) {
  const { deleteItem, isDeleting } = useDeleteGalleryItem();

  async function handleConfirm(e: MouseEvent<HTMLButtonElement>) {
    // AlertDialogAction closes the dialog on click by default — prevented
    // here so it stays open (with a disabled/loading state) until the
    // delete actually finishes, rather than closing optimistically.
    e.preventDefault();
    if (!item) return;

    const result = await deleteItem(item.id, item.imageUrl);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Gallery image deleted.");
    onDeleted();
    onOpenChange(false);
  }

  return (
    <AlertDialog open={item !== null} onOpenChange={(open) => !isDeleting && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this gallery image?</AlertDialogTitle>
          <AlertDialogDescription>
            {item?.caption ? (
              <>
                <strong className="font-medium text-foreground">{item.caption}</strong> will be
                permanently removed from your gallery. This action cannot be undone.
              </>
            ) : (
              "This image will be permanently removed from your gallery. This action cannot be undone."
            )}
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
