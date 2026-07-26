import { Eye, Trash2 } from "lucide-react";

import { LoyaltyBadge } from "@/components/admin/customers/LoyaltyBadge";
import { CustomerStatusBadge } from "@/components/admin/customers/CustomerStatusBadge";
import { Button } from "@/components/common/Button";
import type { CustomerListItem } from "@/services/customers.service";

interface CustomerRowProps {
  customer: CustomerListItem;
  onView: (id: string) => void;
  onDelete: (customer: CustomerListItem) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CustomerRow({ customer, onView, onDelete }: CustomerRowProps) {
  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Customer identity */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt=""
                className="size-9 rounded-full object-cover"
              />
            ) : (
              (customer.firstName[0] ?? "?").toUpperCase()
            )}
          </div>
          <div>
            <p className="font-medium text-foreground leading-snug">{customer.fullName}</p>
            {customer.email && (
              <p className="text-xs text-muted-foreground">{customer.email}</p>
            )}
            {customer.phone && (
              <p className="text-xs text-muted-foreground">{customer.phone}</p>
            )}
          </div>
        </div>
      </td>

      {/* Loyalty */}
      <td className="px-4 py-3">
        <LoyaltyBadge tier={customer.loyaltyTier} size="sm" />
        <p className="mt-1 text-xs text-muted-foreground">
          {customer.loyaltyPoints.toLocaleString()} pts
        </p>
      </td>

      {/* Visits */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-medium text-foreground">{customer.totalVisits}</span>
      </td>

      {/* Spending */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-foreground">
          {formatCurrency(customer.totalSpending)}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <CustomerStatusBadge status={customer.status} />
      </td>

      {/* Joined */}
      <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
        <p className="text-xs text-muted-foreground">{formatDate(customer.createdAt)}</p>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            aria-label={`View ${customer.fullName}`}
            onClick={() => onView(customer.id)}
            className="inline-flex size-8 items-center justify-center p-0"
          >
            <Eye className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label={`Delete ${customer.fullName}`}
            onClick={() => onDelete(customer)}
            className="inline-flex size-8 items-center justify-center p-0 text-destructive"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
