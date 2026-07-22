import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Plus, Quote } from "lucide-react";
import { useState } from "react";

import { DeleteTestimonialDialog } from "@/components/admin/testimonials/DeleteTestimonialDialog";
import { TestimonialRow } from "@/components/admin/testimonials/TestimonialRow";
import { TestimonialsSkeleton } from "@/components/admin/testimonials/TestimonialsSkeleton";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useTestimonials } from "@/hooks/useTestimonials";
import type { TestimonialItem } from "@/services/testimonials.service";

export const Route = createFileRoute("/admin/_authenticated/testimonials/")({
  component: AdminTestimonialsPage,
  head: () => ({
    meta: [{ title: "Testimonials — Admin — Taste Haven" }],
  }),
});

function AdminTestimonialsPage() {
  const { items, isLoading, error, refetch } = useTestimonials();
  const navigate = useNavigate();
  const [itemPendingDelete, setItemPendingDelete] = useState<TestimonialItem | null>(null);

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Testimonials" />
      <PageHeader
        title="Testimonials"
        description="Manage guest testimonials shown on your site."
        action={
          <ActionBar
            label="Add Testimonial"
            icon={Plus}
            onClick={() => navigate({ to: "/admin/testimonials/new" })}
          />
        }
      />
      <SectionContainer>
        {isLoading ? (
          <TestimonialsSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn't load testimonials</p>
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
            icon={Quote}
            title="No testimonials yet."
            description="Testimonials will appear here once they are added."
          />
        ) : (
          <div>
            {items.map((item) => (
              <TestimonialRow
                key={item.id}
                item={item}
                onEdit={(t) =>
                  navigate({
                    to: "/admin/testimonials/$testimonialId/edit",
                    params: { testimonialId: t.id },
                  })
                }
                onDelete={setItemPendingDelete}
              />
            ))}
          </div>
        )}
      </SectionContainer>

      <DeleteTestimonialDialog
        item={itemPendingDelete}
        onOpenChange={(open) => !open && setItemPendingDelete(null)}
        onDeleted={refetch}
      />
    </div>
  );
}
