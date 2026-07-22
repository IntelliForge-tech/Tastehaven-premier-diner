import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Plus } from "lucide-react";
import { useState } from "react";

import { DeleteGalleryImageDialog } from "@/components/admin/gallery/DeleteGalleryImageDialog";
import { GalleryEmptyState } from "@/components/admin/gallery/GalleryEmptyState";
import { GalleryGrid } from "@/components/admin/gallery/GalleryGrid";
import { GallerySkeleton } from "@/components/admin/gallery/GallerySkeleton";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useGalleryItems } from "@/hooks/useGalleryItems";
import { useReorderGallery } from "@/hooks/useReorderGallery";
import type { GalleryImageItem } from "@/services/gallery.service";

export const Route = createFileRoute("/admin/_authenticated/gallery/")({
  component: AdminGalleryPage,
  head: () => ({
    meta: [{ title: "Gallery — Admin — Taste Haven" }],
  }),
});

/**
 * Gallery listing. Phase 7A made this read-only via useGalleryItems();
 * Phase 7B wired ActionBar's "Upload Image" button to navigate to
 * /admin/gallery/new. Phase 7C adds Edit (navigates to
 * /admin/gallery/$imageId/edit) and Delete (a confirmation dialog owned
 * by this page, with refetch() re-running after a successful delete) —
 * the list itself, its loading/error/empty states, and useGalleryItems()
 * are otherwise unchanged. Same shape as menu/index.tsx's Phase 6C
 * additions. Phase 7D adds drag-and-drop reordering via useReorderGallery()
 * — this page renders that hook's (possibly optimistic) `items`, not
 * useGalleryItems()'s raw fetched list directly, so a drag's UI update
 * and rollback-on-failure both happen without waiting on a refetch.
 *
 * Note this file lives at routes/admin/_authenticated/gallery/index.tsx,
 * not a flat gallery.tsx — see this file's Phase 7A doc comment history
 * (now folded into the project handoff) for why: Menu hit a real bug
 * from exactly that flat-file pattern once a sibling `new` route was
 * added, so Gallery started in the directory shape from Phase 7A to
 * avoid repeating it once 7B/7C actually added sibling routes.
 */
function AdminGalleryPage() {
  const { items: fetchedItems, isLoading, error, refetch } = useGalleryItems();
  const { items, isReordering, reorder } = useReorderGallery(fetchedItems);
  const navigate = useNavigate();
  const [itemPendingDelete, setItemPendingDelete] = useState<GalleryImageItem | null>(null);

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Gallery" />
      <PageHeader
        title="Gallery Management"
        description="Manage photos shown in your restaurant gallery."
        action={
          <ActionBar
            label="Upload Image"
            icon={Plus}
            onClick={() => navigate({ to: "/admin/gallery/new" })}
          />
        }
      />
      <SectionContainer>
        {isLoading ? (
          <GallerySkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn't load the gallery</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button
              type="button"
              variant="outline-gold"
              onClick={refetch}
              className="mt-1 px-4 py-2"
            >
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <GalleryGrid
            items={items}
            onEdit={(item) =>
              navigate({ to: "/admin/gallery/$imageId/edit", params: { imageId: item.id } })
            }
            onDelete={setItemPendingDelete}
            onReorder={reorder}
            isReordering={isReordering}
          />
        )}
      </SectionContainer>

      <DeleteGalleryImageDialog
        item={itemPendingDelete}
        onOpenChange={(open) => !open && setItemPendingDelete(null)}
        onDeleted={refetch}
      />
    </div>
  );
}
