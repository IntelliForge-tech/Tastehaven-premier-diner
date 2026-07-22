import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, History, Image, Quote, UtensilsCrossed } from "lucide-react";

import { DashboardCard } from "@/components/admin/dashboard/DashboardCard";
import { EmptyState } from "@/components/admin/dashboard/EmptyState";
import { QuickActions } from "@/components/admin/dashboard/QuickActions";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/_authenticated/")({
  component: AdminDashboardHome,
  head: () => ({
    meta: [{ title: "Admin — Taste Haven" }],
  }),
});

/**
 * Dashboard home (`/admin`). Placeholder content only — stats are
 * hardcoded at 0 and Quick Actions are inert buttons, both intentionally,
 * per this phase's scope. Wiring real counts/actions to Supabase is
 * later work; StatsCardSkeleton/DashboardCardSkeleton are already built
 * and ready for that phase to use as loading states.
 */
function AdminDashboardHome() {
  const { user } = useAuth();
  const firstName = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Welcome back, {firstName}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening at Taste Haven.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Menu Items" value={0} icon={UtensilsCrossed} />
        <StatsCard label="Gallery Images" value={0} icon={Image} />
        <StatsCard label="Reservations" value={0} icon={CalendarCheck} />
        <StatsCard label="Testimonials" value={0} icon={Quote} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardCard title="Recent Activity">
          <EmptyState
            icon={History}
            title="No activity yet"
            description="Changes you make across the admin will show up here."
          />
        </DashboardCard>

        <DashboardCard title="Quick Actions">
          <QuickActions />
        </DashboardCard>
      </div>
    </div>
  );
}
