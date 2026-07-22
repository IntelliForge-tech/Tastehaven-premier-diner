import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { TestimonialForm } from "@/components/admin/testimonials/TestimonialForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTestimonial } from "@/hooks/useTestimonial";

export const Route = createFileRoute(
  "/admin/_authenticated/testimonials/$testimonialId/edit",
)({
  component: AdminEditTestimonialPage,
  head: () => ({
    meta: [{ title: "Edit Testimonial — Admin — Taste Haven" }],
  }),
});

/**
 * Dedicated edit route. Mirrors gallery/$imageId/edit.tsx and
 * menu/$menuId/edit.tsx exactly: this component owns loading the item
 * and navigation; TestimonialForm owns the form in mode="edit";
 * useTestimonial/useUpdateTestimonial own everything Supabase-related.
 */
function AdminEditTestimonialPage() {
  const { testimonialId } = Route.useParams();
  const { item, isLoading, error, refetch } = useTestimonial(testimonialId);
  const navigate = useNavigate();

  function goToList() {
    navigate({ to: "/admin/testimonials" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Edit Testimonial" />
      <PageHeader title="Edit Testimonial" description="Update this testimonial's details." />
      <SectionContainer>
        {isLoading ? (
          <div className="space-y-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn't load this testimonial
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
              <Button type="button" variant="outline" onClick={goToList} className="px-4 py-2">
                Back to Testimonials
              </Button>
            </div>
          </div>
        ) : item ? (
          <TestimonialForm
            mode="edit"
            testimonialId={item.id}
            defaultValues={{
              customerName: item.customerName,
              roleOrLocation: item.roleOrLocation ?? "",
              rating: item.rating,
              reviewText: item.reviewText,
              isFeatured: item.isFeatured,
              isVisible: item.isVisible,
              displayOrder: item.displayOrder,
            }}
            onSuccess={goToList}
            onCancel={goToList}
          />
        ) : null}
      </SectionContainer>
    </div>
  );
}
