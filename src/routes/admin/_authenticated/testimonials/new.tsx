import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { TestimonialForm } from "@/components/admin/testimonials/TestimonialForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/testimonials/new")({
  component: AdminNewTestimonialPage,
  head: () => ({
    meta: [{ title: "Add Testimonial — Admin — Taste Haven" }],
  }),
});

/**
 * Dedicated create route (/admin/testimonials/new). This component owns
 * navigation only — TestimonialForm owns the form and useCreateTestimonial
 * owns the submission. Mirrors menu/new.tsx and gallery/new.tsx exactly.
 */
function AdminNewTestimonialPage() {
  const navigate = useNavigate();

  function goToList() {
    navigate({ to: "/admin/testimonials" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Add Testimonial" />
      <PageHeader
        title="Add Testimonial"
        description="Add a new guest testimonial to your site."
      />
      <SectionContainer>
        <TestimonialForm onSuccess={goToList} onCancel={goToList} />
      </SectionContainer>
    </div>
  );
}
