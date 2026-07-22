import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { OfferForm } from "@/components/admin/offers/OfferForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";

export const Route = createFileRoute("/admin/_authenticated/offers/new")({
  component: AdminNewOfferPage,
  head: () => ({
    meta: [{ title: "Add Offer — Admin — Taste Haven" }],
  }),
});

/**
 * Dedicated create route — sibling to /admin/offers, not nested under
 * it. Owns only where Cancel and success navigate to; OfferForm owns
 * the form itself, useCreateOffer() owns the data workflow. Mirrors
 * chefs/new.tsx and testimonials/new.tsx exactly.
 */
function AdminNewOfferPage() {
  const navigate = useNavigate();

  function goToOffersList() {
    navigate({ to: "/admin/offers" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Add Offer" />
      <PageHeader title="Add Offer" description="Create a new special offer or promotion." />
      <SectionContainer>
        <OfferForm mode="create" onSuccess={goToOffersList} onCancel={goToOffersList} />
      </SectionContainer>
    </div>
  );
}
