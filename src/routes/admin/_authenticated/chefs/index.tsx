import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ChefHat, Plus } from "lucide-react";
import { useState } from "react";

import { ChefRow } from "@/components/admin/chefs/ChefRow";
import { ChefsSkeleton } from "@/components/admin/chefs/ChefsSkeleton";
import { DeleteChefDialog } from "@/components/admin/chefs/DeleteChefDialog";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useChefs } from "@/hooks/useChefs";
import type { ChefItem } from "@/services/chefs.service";

export const Route = createFileRoute("/admin/_authenticated/chefs/")({
  component: AdminChefsPage,
  head: () => ({
    meta: [{ title: "Chefs — Admin — Taste Haven" }],
  }),
});

/**
 * Chefs Management listing page — Phase 9A (read) + 9B (create) + 9C
 * (edit/delete). Edit navigates to /admin/chefs/$chefId/edit; Delete
 * opens DeleteChefDialog (same state pattern as the Gallery listing).
 */
function AdminChefsPage() {
  const { items, isLoading, error, refetch } = useChefs();
  const navigate = useNavigate();
  const [chefToDelete, setChefToDelete] = useState<ChefItem | null>(null);

  function handleEdit(chef: ChefItem) {
    navigate({ to: "/admin/chefs/$chefId/edit", params: { chefId: chef.id } });
  }

  function handleDelete(chef: ChefItem) {
    setChefToDelete(chef);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Chefs" />
      <PageHeader
        title="Chefs"
        description="Manage your featured chefs and their profiles."
        action={
          <ActionBar
            label="Add Chef"
            icon={Plus}
            onClick={() => navigate({ to: "/admin/chefs/new" })}
          />
        }
      />
      <SectionContainer>
        {isLoading ? (
          <ChefsSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn&apos;t load chef profiles
            </p>
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
          <EmptyState
            icon={ChefHat}
            title="No chef profiles yet."
            description="Chef profiles will appear here once they are added."
          />
        ) : (
          <div>
            {items.map((chef) => (
              <ChefRow
                key={chef.id}
                chef={chef}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </SectionContainer>

      <DeleteChefDialog
        chef={chefToDelete}
        onOpenChange={(open) => !open && setChefToDelete(null)}
        onDeleted={() => {
          setChefToDelete(null);
          refetch();
        }}
      />
    </div>
  );
}
