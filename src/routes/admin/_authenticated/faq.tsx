import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, HelpCircle, Plus } from "lucide-react";
import { useState } from "react";

import { DeleteFaqDialog } from "@/components/admin/faq/DeleteFaqDialog";
import { FaqForm } from "@/components/admin/faq/FaqForm";
import { FaqRow } from "@/components/admin/faq/FaqRow";
import { FaqSkeleton } from "@/components/admin/faq/FaqSkeleton";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFaqs } from "@/hooks/useFaqs";
import type { FaqItem } from "@/services/faq.service";

export const Route = createFileRoute("/admin/_authenticated/faq")({
  component: AdminFaqPage,
  head: () => ({
    meta: [{ title: "FAQ — Admin — Taste Haven" }],
  }),
});

type DialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; item: FaqItem };

function AdminFaqPage() {
  const { items, isLoading, error, refetch } = useFaqs();
  const [dialog, setDialog] = useState<DialogState>({ type: "closed" });
  const [itemPendingDelete, setItemPendingDelete] = useState<FaqItem | null>(null);

  const nextDisplayOrder = items.length > 0
    ? Math.max(...items.map((f) => f.displayOrder)) + 1
    : 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs page="FAQ" />
      <PageHeader
        title="FAQ"
        description="Manage frequently asked questions shown on your website."
        action={
          <ActionBar
            label="Add FAQ"
            icon={Plus}
            onClick={() => setDialog({ type: "create" })}
          />
        }
      />

      <SectionContainer>
        {isLoading ? (
          <FaqSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium">Couldn&apos;t load FAQs</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetch} className="mt-1 px-4 py-2">
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No FAQs yet."
            description="Add your first frequently asked question to help guests before they visit."
            action={
              <Button
                type="button"
                variant="gold"
                onClick={() => setDialog({ type: "create" })}
                className="inline-flex items-center gap-2 px-5 py-2.5"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add FAQ
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <FaqRow
                key={item.id}
                item={item}
                onEdit={(i) => setDialog({ type: "edit", item: i })}
                onDelete={(i) => setItemPendingDelete(i)}
              />
            ))}
          </div>
        )}
      </SectionContainer>

      {/* Create / Edit dialog */}
      <Dialog
        open={dialog.type !== "closed"}
        onOpenChange={(open) => { if (!open) setDialog({ type: "closed" }); }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialog.type === "create" ? "Add FAQ" : "Edit FAQ"}
            </DialogTitle>
          </DialogHeader>
          {dialog.type === "create" && (
            <FaqForm
              mode="create"
              nextDisplayOrder={nextDisplayOrder}
              onSuccess={() => { setDialog({ type: "closed" }); refetch(); }}
              onCancel={() => setDialog({ type: "closed" })}
            />
          )}
          {dialog.type === "edit" && (
            <FaqForm
              mode="edit"
              item={dialog.item}
              onSuccess={() => { setDialog({ type: "closed" }); refetch(); }}
              onCancel={() => setDialog({ type: "closed" })}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <DeleteFaqDialog
        item={itemPendingDelete}
        onClose={() => setItemPendingDelete(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
