import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Plus, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { DeleteMenuItemDialog } from "@/components/admin/menu/DeleteMenuItemDialog";
import { MenuItemRow } from "@/components/admin/menu/MenuItemRow";
import { MenuItemsSkeleton } from "@/components/admin/menu/MenuItemsSkeleton";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useMenuItems } from "@/hooks/useMenuItems";
import type { MenuItemWithCategory } from "@/services/menu/menu.service";

export const Route = createFileRoute("/admin/_authenticated/menu/")({
  component: AdminMenuPage,
  head: () => ({
    meta: [{ title: "Menu — Admin — Taste Haven" }],
  }),
});

/**
 * Menu listing. Phase 6A made this read-only via useMenuItems(); Phase
 * 6B wired ActionBar's "Add Menu Item" button to navigate to the
 * dedicated /admin/menu/new route. Phase 6C adds Edit (navigates to
 * /admin/menu/$menuId/edit) and Delete (a confirmation dialog owned by
 * this page, with refetch() re-running after a successful delete) — the
 * list itself, its loading/error/empty states, and useMenuItems() are
 * otherwise unchanged.
 *
 * Note this file moved from routes/admin/_authenticated/menu.tsx to
 * routes/admin/_authenticated/menu/index.tsx (same path, /admin/menu) so
 * that menu/new.tsx and menu/$menuId/edit.tsx can exist as true sibling
 * routes rather than nested children requiring this page to render an
 * <Outlet />. The old menu.tsx file has been removed — its presence
 * alongside this menu/ directory was making TanStack Router treat it as
 * a parent layout route with no <Outlet />, which would have silently
 * broken /admin/menu/new and this phase's new edit route.
 */
function AdminMenuPage() {
  const { items, isLoading, error, refetch } = useMenuItems();
  const navigate = useNavigate();
  const [itemPendingDelete, setItemPendingDelete] = useState<MenuItemWithCategory | null>(null);

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Menu" />
      <PageHeader
        title="Menu Management"
        description="Manage your restaurant menu."
        action={
          <ActionBar
            label="Add Menu Item"
            icon={Plus}
            onClick={() => navigate({ to: "/admin/menu/new" })}
          />
        }
      />
      <SectionContainer>
        {isLoading ? (
          <MenuItemsSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn't load the menu</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetch} className="mt-1 px-4 py-2">
              Try again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={UtensilsCrossed}
            title="No menu items yet."
            description="Menu items will appear here once they are created."
          />
        ) : (
          <div>
            {items.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                onEdit={(item) => navigate({ to: "/admin/menu/$menuId/edit", params: { menuId: item.id } })}
                onDelete={setItemPendingDelete}
              />
            ))}
          </div>
        )}
      </SectionContainer>

      <DeleteMenuItemDialog
        item={itemPendingDelete}
        onOpenChange={(open) => !open && setItemPendingDelete(null)}
        onDeleted={refetch}
      />
    </div>
  );
}
