import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { MenuForm } from "@/components/admin/menu/MenuForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuItem } from "@/hooks/useMenuItem";

export const Route = createFileRoute("/admin/_authenticated/menu/$menuId/edit")({
  component: AdminEditMenuItemPage,
  head: () => ({
    meta: [{ title: "Edit Menu Item — Admin — Taste Haven" }],
  }),
});

/**
 * Dedicated edit route (Phase 6C), sibling to /admin/menu and
 * /admin/menu/new. Same division of responsibility as the New page: this
 * component owns loading the item and navigation ("back"/"after
 * success"); MenuForm owns the form itself (in "edit" mode here), and
 * useMenuItem()/useUpdateMenuItem() own everything Supabase-related.
 */
function AdminEditMenuItemPage() {
  const { menuId } = Route.useParams();
  const { item, isLoading, error, refetch } = useMenuItem(menuId);
  const navigate = useNavigate();

  function goToMenuList() {
    navigate({ to: "/admin/menu" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Edit Menu Item" />
      <PageHeader title="Edit Menu Item" description="Update this item's details." />
      <SectionContainer>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn't load this menu item</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <div className="mt-1 flex gap-3">
              {error.code !== "not_found" && (
                <Button type="button" variant="outline-gold" onClick={refetch} className="px-4 py-2">
                  Try again
                </Button>
              )}
              <Button type="button" variant="outline" onClick={goToMenuList} className="px-4 py-2">
                Back to Menu
              </Button>
            </div>
          </div>
        ) : item ? (
          <MenuForm
            mode="edit"
            menuId={item.id}
            defaultValues={{
              name: item.name,
              description: item.description ?? "",
              categoryId: item.categoryId,
              price: item.price,
              isFeatured: item.isFeatured,
              isAvailable: item.isAvailable,
            }}
            existingImageUrl={item.imageUrl}
            onSuccess={goToMenuList}
            onCancel={goToMenuList}
          />
        ) : null}
      </SectionContainer>
    </div>
  );
}
