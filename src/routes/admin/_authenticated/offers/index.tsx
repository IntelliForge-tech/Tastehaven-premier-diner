import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Percent, Plus } from "lucide-react";
import { useState } from "react";

import { DeleteOfferDialog } from "@/components/admin/offers/DeleteOfferDialog";
import { OfferRow } from "@/components/admin/offers/OfferRow";
import { OffersSkeleton } from "@/components/admin/offers/OffersSkeleton";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { ActionBar } from "@/components/admin/page/ActionBar";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useOffers } from "@/hooks/useOffers";
import type { OfferItem } from "@/services/offers.service";

export const Route = createFileRoute("/admin/_authenticated/offers/")({
  component: AdminOffersPage,
  head: () => ({
    meta: [{ title: "Offers — Admin — Taste Haven" }],
  }),
});

function AdminOffersPage() {
  const { items, isLoading, error, refetch } = useOffers();
  const navigate = useNavigate();
  const [offerToDelete, setOfferToDelete] = useState<OfferItem | null>(null);

  function handleEdit(item: OfferItem) {
    navigate({ to: "/admin/offers/$offerId/edit", params: { offerId: item.id } });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Offers" />
      <PageHeader
        title="Special Offers"
        description="Manage special offers and promotions shown on your site."
        action={
          <ActionBar
            label="Add Offer"
            icon={Plus}
            onClick={() => navigate({ to: "/admin/offers/new" })}
          />
        }
      />
      <SectionContainer>
        {isLoading ? (
          <OffersSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn't load offers</p>
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
            icon={Percent}
            title="No offers yet."
            description="Special offers will appear here once they are created."
          />
        ) : (
          <div>
            {items.map((item) => (
              <OfferRow
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={setOfferToDelete}
              />
            ))}
          </div>
        )}
      </SectionContainer>

      <DeleteOfferDialog
        offer={offerToDelete}
        onOpenChange={(open) => !open && setOfferToDelete(null)}
        onDeleted={() => {
          setOfferToDelete(null);
          refetch();
        }}
      />
    </div>
  );
}
