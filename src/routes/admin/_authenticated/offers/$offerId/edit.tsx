import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

import { OfferForm } from "@/components/admin/offers/OfferForm";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOffer } from "@/hooks/useOffer";

export const Route = createFileRoute("/admin/_authenticated/offers/$offerId/edit")({
  component: AdminEditOfferPage,
  head: () => ({
    meta: [{ title: "Edit Offer — Admin — Taste Haven" }],
  }),
});

/**
 * Edit Offer page — same structure as AdminEditChefPage and the gallery
 * edit page: this component owns loading + navigation, OfferForm owns
 * the form, useOffer + useUpdateOffer (via OfferForm) own all Supabase
 * communication. "not_found" suppresses the retry button; other errors
 * show both Retry and Back.
 */
function AdminEditOfferPage() {
  const { offerId } = Route.useParams();
  const { offer, isLoading, error, refetch } = useOffer(offerId);
  const navigate = useNavigate();

  function goToOffersList() {
    navigate({ to: "/admin/offers" });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Edit Offer" />
      <PageHeader title="Edit Offer" description="Update this special offer." />
      <SectionContainer>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-28 w-full" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Couldn&apos;t load this offer
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
                onClick={goToOffersList}
                className="px-4 py-2"
              >
                Back to Offers
              </Button>
            </div>
          </div>
        ) : offer ? (
          <OfferForm
            mode="edit"
            offerId={offer.id}
            defaultValues={{
              title: offer.title,
              description: offer.description ?? "",
              tag: offer.tag ?? "",
              icon: offer.icon ?? "",
              validFrom: offer.validFrom ?? "",
              validUntil: offer.validUntil ?? "",
              isActive: offer.isActive,
              displayOrder: offer.displayOrder,
            }}
            onSuccess={goToOffersList}
            onCancel={goToOffersList}
          />
        ) : null}
      </SectionContainer>
    </div>
  );
}
