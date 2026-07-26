import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, Calendar, Mail, Phone, MapPin } from "lucide-react";

import { LoyaltyBadge, LoyaltyProgress } from "@/components/admin/customers/LoyaltyBadge";
import { CustomerStatusBadge } from "@/components/admin/customers/CustomerStatusBadge";
import { CustomerNotesCard } from "@/components/admin/customers/CustomerNotesCard";
import { CustomerTagsCard } from "@/components/admin/customers/CustomerTagsCard";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { useCustomer } from "@/hooks/useCustomerHooks";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/_authenticated/customers/$customerId")({
  component: AdminCustomerDetailPage,
  head: () => ({ meta: [{ title: "Customer — Admin — Taste Haven" }] }),
});

function AdminCustomerDetailPage() {
  const { customerId } = Route.useParams();
  const { customer, isLoading, error, refetch } = useCustomer(customerId);
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Breadcrumbs page="Customer" />
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 rounded-2xl bg-muted" />
          <div className="col-span-2 h-64 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <Breadcrumbs page="Customer" />
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {error?.code === "not_found" ? "Customer not found." : "Couldn't load customer."}
          </p>
          {error && error.code !== "not_found" && (
            <Button type="button" variant="outline-gold" onClick={refetch} className="px-4 py-2">
              Try again
            </Button>
          )}
          <Link to="/admin/customers" className="text-sm text-primary hover:underline">
            ← Back to Customers
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/admin" className="hover:text-foreground">Dashboard</Link>
        <span>/</span>
        <Link to="/admin/customers" className="hover:text-foreground">Customers</Link>
        <span>/</span>
        <span className="font-medium text-foreground">{customer.fullName}</span>
      </nav>

      {/* Back */}
      <Link
        to="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Customers
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column — profile card */}
        <div className="space-y-4">
          <Card className="p-6 text-center">
            {/* Avatar */}
            <div className="mx-auto mb-4 grid size-20 place-items-center rounded-full bg-primary/15 text-3xl font-semibold text-primary">
              {customer.avatar ? (
                <img src={customer.avatar} alt="" className="size-20 rounded-full object-cover" />
              ) : (
                (customer.firstName[0] ?? "?").toUpperCase()
              )}
            </div>

            <h2 className="font-display text-xl font-semibold text-foreground">
              {customer.fullName}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <LoyaltyBadge tier={customer.loyaltyTier} />
              <CustomerStatusBadge status={customer.status} />
            </div>

            {/* Loyalty progress */}
            <div className="mt-4">
              <LoyaltyProgress tier={customer.loyaltyTier} lifetimePoints={customer.lifetimePoints} />
            </div>

            {/* Contact */}
            <div className="mt-5 space-y-2 text-left">
              {customer.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="size-4 shrink-0" />
                  <a href={`mailto:${customer.email}`} className="hover:text-foreground truncate">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <a href={`tel:${customer.phone}`} className="hover:text-foreground">
                    {customer.phone}
                  </a>
                </div>
              )}
              {(customer.city || customer.country) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4 shrink-0" />
                  <span>{[customer.city, customer.country].filter(Boolean).join(", ")}</span>
                </div>
              )}
              {customer.birthDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4 shrink-0" />
                  <span>
                    Birthday:{" "}
                    {new Date(customer.birthDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Stats card */}
          <Card className="divide-y divide-border">
            {[
              { label: "Total Visits", value: customer.totalVisits },
              { label: "Total Spending", value: `$${customer.totalSpending.toLocaleString()}` },
              { label: "Loyalty Points", value: customer.loyaltyPoints.toLocaleString() },
              { label: "Lifetime Points", value: customer.lifetimePoints.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Tags */}
          <CustomerTagsCard customerId={customer.id} />

          {/* Notes */}
          <CustomerNotesCard
            customerId={customer.id}
            adminUserId={user?.id ?? null}
          />

          {/* Member since */}
          <Card className="p-5">
            <p className="text-xs text-muted-foreground">
              Member since{" "}
              {new Date(customer.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              Last updated{" "}
              {new Date(customer.updatedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
