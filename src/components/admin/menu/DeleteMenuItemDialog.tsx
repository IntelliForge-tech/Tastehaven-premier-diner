import { Loader2 } from "lucide-react";
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
import { useDeleteMenuItem } from "@/hooks/useDeleteMenuItem";
import type { MenuItemWithCategory } from "@/services/menu/menu.service";

interface DeleteMenuItemDialogProps {
  /** The item pending deletion, or null when the dialog should be closed. */
  item: MenuItemWithCategory | null;
  /** Called on cancel, and after a successful delete. */
  onOpenChange: (open: boolean) => void;
  /** Called after a successful delete, so the caller can refetch the list. */
  onDeleted: () => void;
}

/**
 * Confirmation dialog for deleting a menu item, built on the existing
 * shadcn AlertDialog primitive rather than a bespoke modal. Owns nothing
 * about the menu list itself — the listing page tells it which item (if
 * any) is pending deletion and reacts to onDeleted by refetching.
 */
export function DeleteMenuItemDialog({ item, onOpenChange, onDeleted }: DeleteMenuItemDialogProps) {
  const { deleteItem, isDeleting } = useDeleteMenuItem();

  async function handleConfirm(e: Event) {
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

    toast.success("Menu item deleted.");
    onDeleted();
    onOpenChange(false);
  }

  return (
    <AlertDialog open={item !== null} onOpenChange={(open) => !isDeleting && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this menu item?</AlertDialogTitle>
          <AlertDialogDescription>
            {item ? (
              <>
                <strong className="font-medium text-foreground">{item.name}</strong> will be
                permanently removed from your menu. This action cannot be undone.
              </>
            ) : (
              "This action cannot be undone."
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
