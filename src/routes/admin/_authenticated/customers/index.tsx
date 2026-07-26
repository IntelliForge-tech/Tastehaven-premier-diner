import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Users } from "lucide-react";
import { useState, useDeferredValue } from "react";
import { toast } from "sonner";

import { CustomerRow } from "@/components/admin/customers/CustomerRow";
import { CustomersSkeleton } from "@/components/admin/customers/CustomersSkeleton";
import { CustomerSearchBar } from "@/components/admin/customers/CustomerSearchBar";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { SectionContainer } from "@/components/admin/page/SectionContainer";
import { Button } from "@/components/common/Button";
import { useCustomers } from "@/hooks/useCustomers";
import { deleteCustomer } from "@/services/customers.service";
import type { CustomerListItem, LoyaltyTier, CustomerStatus } from "@/services/customers.service";

export const Route = createFileRoute("/admin/_authenticated/customers/")({
  component: AdminCustomersPage,
  head: () => ({ meta: [{ title: "Customers — Admin — Taste Haven" }] }),
});

function AdminCustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<LoyaltyTier | null>(null);
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | null>(null);
  const [sortField, setSortField] = useState<"created_at" | "total_spending" | "total_visits" | "first_name">("created_at");
  const [sortOrder] = useState<"asc" | "desc">("desc");
  const [customerToDelete, setCustomerToDelete] = useState<CustomerListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const deferredSearch = useDeferredValue(search);

  const { customers, isLoading, error, refetch } = useCustomers({
    search: deferredSearch || undefined,
    loyaltyTier: tierFilter,
    status: statusFilter,
    sortField,
    sortOrder,
  });

  async function handleDeleteConfirm() {
    if (!customerToDelete) return;
    setIsDeleting(true);
    const result = await deleteCustomer(customerToDelete.id);
    setIsDeleting(false);

    if (!result.success) {
      toast.error(result.error.message);
      return;
    }

    toast.success("Customer deleted.");
    setCustomerToDelete(null);
    refetch();
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Customers" />
      <PageHeader
        title="Customers"
        description="Manage guest profiles, loyalty, and visit history."
        action={
          <Button
            type="button"
            variant="gold"
            onClick={() => navigate({ to: "/admin/customers/analytics" })}
            className="px-4 py-2 text-sm"
          >
            View Analytics
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <CustomerSearchBar value={search} onChange={setSearch} />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Tier filter */}
          <select
            value={tierFilter ?? ""}
            onChange={(e) => setTierFilter((e.target.value as LoyaltyTier) || null)}
            className="rounded-full border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by loyalty tier"
          >
            <option value="">All Tiers</option>
            {(["bronze", "silver", "gold", "platinum", "diamond"] as LoyaltyTier[]).map((t) => (
              <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter ?? ""}
            onChange={(e) => setStatusFilter((e.target.value as CustomerStatus) || null)}
            className="rounded-full border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blacklisted">Blacklisted</option>
          </select>

          {/* Sort */}
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as typeof sortField)}
            className="rounded-full border border-border bg-muted/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label="Sort customers"
          >
            <option value="created_at">Newest</option>
            <option value="first_name">Alphabetical</option>
            <option value="total_visits">Most Visits</option>
            <option value="total_spending">Highest Spending</option>
          </select>
        </div>
      </div>

      <SectionContainer className="p-0">
        {isLoading ? (
          <div className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <CustomersTableHead />
              <tbody><CustomersSkeleton /></tbody>
            </table>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <div className="grid size-11 place-items-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-foreground">Couldn&apos;t load customers</p>
            <p className="max-w-xs text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline-gold" onClick={refetch} className="mt-1 px-4 py-2">
              Try again
            </Button>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No customers found."
              description={
                search || tierFilter || statusFilter
                  ? "Try adjusting your filters."
                  : "Customers are created automatically from reservations."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <CustomersTableHead />
              <tbody>
                {customers.map((c) => (
                  <CustomerRow
                    key={c.id}
                    customer={c}
                    onView={(id) => navigate({ to: "/admin/customers/$customerId", params: { customerId: id } })}
                    onDelete={setCustomerToDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionContainer>

      {/* Delete confirmation dialog */}
      {customerToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-customer-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 id="delete-customer-title" className="mb-1 text-base font-semibold text-foreground">
              Delete customer?
            </h2>
            <p className="mb-5 text-sm text-muted-foreground">
              <strong>{customerToDelete.fullName}</strong> and all their notes, tags, and loyalty history will be permanently deleted.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gold"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="bg-destructive px-4 py-2 hover:opacity-90"
              >
                {isDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomersTableHead() {
  return (
    <thead>
      <tr className="border-b border-border text-left">
        {["Customer", "Loyalty", "Visits", "Spending", "Status", "Joined", "Actions"].map(
          (h, i) => (
            <th
              key={h}
              className={[
                "px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                i === 2 ? "text-center" : "",
                i === 5 ? "hidden lg:table-cell" : "",
                i === 6 ? "text-right" : "",
              ].join(" ")}
            >
              {h}
            </th>
          ),
        )}
      </tr>
    </thead>
  );
}
