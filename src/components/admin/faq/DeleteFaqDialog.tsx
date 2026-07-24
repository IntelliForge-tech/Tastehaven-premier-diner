import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteFaq } from "@/hooks/useDeleteFaq";
import type { FaqItem } from "@/services/faq.service";

interface DeleteFaqDialogProps {
  item: FaqItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteFaqDialog({ item, onClose, onSuccess }: DeleteFaqDialogProps) {
  const { isDeleting, deleteItem } = useDeleteFaq();

  async function handleConfirm() {
    if (!item) return;
    const result = await deleteItem(item.id);
    if (!result.success) {
      toast.error(result.error.message);
      return;
    }
    toast.success("FAQ deleted.");
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={!!item} onOpenChange={(open) => { if (!open && !isDeleting) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete FAQ</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete this FAQ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        {item && (
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <p className="font-medium text-foreground">{item.question}</p>
            <p className="mt-1 line-clamp-2 text-muted-foreground">{item.answer}</p>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="gold"
            disabled={isDeleting}
            aria-busy={isDeleting}
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2 bg-destructive hover:bg-destructive/90 border-destructive text-white"
          >
            {isDeleting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Delete FAQ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
