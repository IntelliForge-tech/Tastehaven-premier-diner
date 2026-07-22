import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { ChefForm } from "@/components/admin/chefs/ChefForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChef } from "@/hooks/useChef";

export const Route = createFileRoute("/admin/_authenticated/chefs/$chefId/edit")({
  component: AdminEditChefPage,
  head: () => ({
    meta: [{ title: "Edit Chef — Admin — Taste Haven" }],
  }),
});

/**
 * Edit Chef route — mirrors the Gallery edit route exactly in its
 * structure: this component owns loading the chef and navigation; ChefForm
 * (in edit mode) owns the form itself; useChef() + useUpdateChef() own
 * everything Supabase-related.
 *
 * Error state: "not_found" gets no retry button (the record is gone;
 * sending the admin back to the list is the only sensible action), other
 * errors get both Try Again and Back — same pattern as Gallery's edit page.
 */
function AdminEditChefPage() {
  const { chefId } = Route.useParams();
  const { chef, isLoading, error, refetch } = useChef(chefId);
  const navigate = useNavigate();

  function goToChefsList() {
    navigate({ to: "/admin/chefs" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Edit Chef" />
      <PageHeader title="Edit Chef" description="Update this chef's profile." />
      <SectionContainer>
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-28 w-full" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn&apos;t load this chef profile
            </p>
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
                onClick={goToChefsList}
                className="px-4 py-2"
              >
                Back to Chefs
              </Button>
            </div>
          </div>
        ) : chef ? (
          <ChefForm
            mode="edit"
            chefId={chef.id}
            defaultValues={{
              name: chef.name,
              position: chef.position,
              bio: chef.bio ?? "",
              yearsExperience: chef.yearsExperience,
              displayOrder: chef.displayOrder,
              isActive: chef.isActive,
            }}
            existingImageUrl={chef.imageUrl}
            onSuccess={goToChefsList}
            onCancel={goToChefsList}
          />
        ) : null}
      </SectionContainer>
    </div>
  );
}
