import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { GalleryForm } from "@/components/admin/gallery/GalleryForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGalleryItem } from "@/hooks/useGalleryItem";

export const Route = createFileRoute("/admin/_authenticated/gallery/$imageId/edit")({
  component: AdminEditGalleryItemPage,
  head: () => ({
    meta: [{ title: "Edit Gallery Image — Admin — Taste Haven" }],
  }),
});

/**
 * Dedicated edit route (Phase 7C), sibling to /admin/gallery and
 * /admin/gallery/new. Same division of responsibility as menu's Edit
 * page: this component owns loading the item and navigation
 * ("back"/"after success"); GalleryForm owns the form itself (in "edit"
 * mode here), and useGalleryItem()/useUpdateGalleryItem() own
 * everything Supabase-related.
 */
function AdminEditGalleryItemPage() {
  const { imageId } = Route.useParams();
  const { item, isLoading, error, refetch } = useGalleryItem(imageId);
  const navigate = useNavigate();

  function goToGalleryList() {
    navigate({ to: "/admin/gallery" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Edit Gallery Image" />
      <PageHeader title="Edit Gallery Image" description="Update this image's details." />
      <SectionContainer>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-40" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn't load this gallery image</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <div className="mt-1 flex gap-3">
              {error.code !== "not_found" && (
                <Button
                  type="button"
                  variant="outline-gold"
                  onClick={refetch}
                  className="px-4 py-2"
                >
                  Try again
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={goToGalleryList}
                className="px-4 py-2"
              >
                Back to Gallery
              </Button>
            </div>
          </div>
        ) : item ? (
          <GalleryForm
            mode="edit"
            galleryItemId={item.id}
            defaultValues={{
              caption: item.caption ?? "",
              altText: item.altText,
              isFeatured: item.isFeatured,
            }}
            existingImageUrl={item.imageUrl}
            onSuccess={goToGalleryList}
            onCancel={goToGalleryList}
          />
        ) : null}
      </SectionContainer>
    </div>
  );
}
