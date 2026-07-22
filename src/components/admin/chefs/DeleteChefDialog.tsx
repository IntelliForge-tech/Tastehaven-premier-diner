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
import { useDeleteChef } from "@/hooks/useDeleteChef";
import type { ChefItem } from "@/services/chefs.service";

interface DeleteChefDialogProps {
  /** The chef pending deletion, or null when the dialog should be closed. */
  chef: ChefItem | null;
  /** Called on cancel and after a successful delete. */
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete so the caller can refetch the list. */
  onDeleted: () => void;
}

/**
 * Confirmation dialog for deleting a chef, mirroring
 * DeleteGalleryImageDialog.tsx exactly (same AlertDialog primitive,
 * same "prevent default to hold it open during the request" pattern).
 * Shows the chef's name and position in the confirmation copy — unlike
 * Gallery where `caption` is optional, `name` is always present for
 * chefs, so no fallback wording needed.
 */
export function DeleteChefDialog({
  chef,
  onOpenChange,
  onDeleted,
}: DeleteChefDialogProps) {
  const { deleteItem, isDeleting } = useDeleteChef();

  async function handleConfirm(e: MouseEvent<HTMLButtonElement>) {
    // Keep the dialog open with a loading state until the delete
    // finishes — same approach as DeleteGalleryImageDialog.
    e.preventDefault();
    if (!chef) return;

    const result = await deleteItem(chef.id, chef.imageUrl);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Chef profile deleted.");
    onDeleted();
    onOpenChange(false);
  }

  return (
    <AlertDialog open={chef !== null} onOpenChange={(open) => !isDeleting && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this chef profile?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong className="font-medium text-foreground">{chef?.name}</strong>
            {chef?.position ? (
              <> ({chef.position})</>
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
