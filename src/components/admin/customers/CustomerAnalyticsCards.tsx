import { Crown, Star, TrendingUp, Users } from "lucide-react";

import { Card } from "@/components/common/Card";
import { LoyaltyBadge } from "@/components/admin/customers/LoyaltyBadge";
import type { CustomerAnalytics } from "@/services/customers.service";

interface CustomerAnalyticsCardsProps {
  analytics: CustomerAnalytics;
}

function StatTile({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: typeof Users;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/70">{sub}</p>}
      </div>
    </Card>
  );
}

export function CustomerAnalyticsCards({ analytics }: CustomerAnalyticsCardsProps) {
  return (
    <div className="space-y-4">
      {/* Top-line stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total Customers" value={analytics.totalCustomers} icon={Users} />
        <StatTile label="New This Month" value={analytics.newThisMonth} icon={TrendingUp} />
        <StatTile label="Active Customers" value={analytics.activeCustomers} icon={Star} />
        <StatTile label="VIP Customers" value={analytics.vipCustomers} icon={Crown} />
      </div>

      {/* Spending */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg Spending</p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">
            ${analytics.averageSpending.toFixed(0)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">
            ${analytics.totalSpending.toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Tier breakdown */}
      <Card className="p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">Loyalty Tier Distribution</p>
        <div className="space-y-3">
          {(
            [
              { tier: "diamond", count: analytics.diamondCount },
              { tier: "platinum", count: analytics.platinumCount },
              { tier: "gold", count: analytics.goldCount },
              { tier: "silver", count: analytics.silverCount },
              { tier: "bronze", count: analytics.bronzeCount },
            ] as const
          ).map(({ tier, count }) => {
            const pct =
              analytics.totalCustomers > 0
                ? Math.round((count / analytics.totalCustomers) * 100)
                : 0;
            return (
              <div key={tier} className="flex items-center gap-3">
                <LoyaltyBadge tier={tier} size="sm" />
                <div className="flex-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/60"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{count}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
