import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { CustomerAnalyticsCards } from "@/components/admin/customers/CustomerAnalyticsCards";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useCustomerAnalytics } from "@/hooks/useCustomerHooks";

export const Route = createFileRoute("/admin/_authenticated/customers/analytics")({
  component: AdminCustomerAnalyticsPage,
  head: () => ({ meta: [{ title: "Customer Analytics — Admin — Taste Haven" }] }),
});

function AdminCustomerAnalyticsPage() {
  const { analytics, isLoading, error, refetch } = useCustomerAnalytics();

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Customer Analytics" />

      <Link
        to="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Customers
      </Link>

      <PageHeader
        title="Customer Analytics"
        description="Overview of your customer base, loyalty distribution, and spending."
      />

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="h-56 rounded-2xl bg-muted" />
        </div>
      ) : error ? (
        <SectionContainer>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn&apos;t load analytics</p>
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
        </SectionContainer>
      ) : analytics ? (
        <CustomerAnalyticsCards analytics={analytics} />
      ) : null}
    </div>
  );
}
