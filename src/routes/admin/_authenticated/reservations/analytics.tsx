import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart3,
  CalendarCheck,
  CalendarClock,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

import { Breadcrumbs } from "@/components/admin/page/Breadcrumbs";
import { PageHeader } from "@/components/admin/page/PageHeader";
import { Button } from "@/components/common/Button";
import { useReservationAnalytics } from "@/hooks/useReservationAnalytics";

export const Route = createFileRoute(
  "/admin/_authenticated/reservations/analytics",
)({
  component: AdminReservationsAnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — Reservations — Admin — Taste Haven" }] }),
});

function AdminReservationsAnalyticsPage() {
  const { analytics, isLoading, error, refetch } = useReservationAnalytics();

  return (
    <div className="space-y-6">
      <Breadcrumbs page="Analytics" />
      <PageHeader
        title="Reservation Analytics"
        description="Key metrics, trends, and performance indicators."
        action={
          <Button type="button" variant="outline-gold" onClick={refetch} className="gap-2 h-8 px-3 text-xs">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-muted" />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <AlertTriangle className="size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button type="button" variant="outline-gold" onClick={refetch}>Retry</Button>
        </div>
      ) : analytics ? (
        <div className="space-y-8">
          {/* Volume */}
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Reservation Volume
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <AnalyticsCard icon={<CalendarCheck className="size-5" />} label="Today" value={analytics.today} color="text-primary bg-primary/10" />
              <AnalyticsCard icon={<CalendarClock className="size-5" />} label="Tomorrow" value={analytics.tomorrow} color="text-blue-500 bg-blue-500/10" />
              <AnalyticsCard icon={<TrendingUp className="size-5" />} label="This Week" value={analytics.thisWeek} color="text-violet-500 bg-violet-500/10" />
              <AnalyticsCard icon={<BarChart3 className="size-5" />} label="This Month" value={analytics.thisMonth} color="text-emerald-500 bg-emerald-500/10" />
            </div>
          </section>

          {/* Status breakdown */}
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Status Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <AnalyticsCard icon={<Clock className="size-5" />} label="Pending" value={analytics.pending} color="text-yellow-600 bg-yellow-500/10" />
              <AnalyticsCard icon={<CheckCircle className="size-5" />} label="Confirmed" value={analytics.confirmed} color="text-green-600 bg-green-500/10" />
              <AnalyticsCard icon={<Users className="size-5" />} label="Checked In" value={analytics.checkedIn} color="text-blue-600 bg-blue-500/10" />
              <AnalyticsCard icon={<Users className="size-5" />} label="Seated" value={analytics.seated} color="text-violet-600 bg-violet-500/10" />
              <AnalyticsCard icon={<CheckCircle className="size-5" />} label="Completed" value={analytics.completed} color="text-emerald-600 bg-emerald-500/10" />
              <AnalyticsCard icon={<XCircle className="size-5" />} label="Cancelled" value={analytics.cancelled} color="text-destructive bg-destructive/10" />
              <AnalyticsCard icon={<UserX className="size-5" />} label="No Show" value={analytics.noShow} color="text-orange-600 bg-orange-500/10" />
            </div>
          </section>

          {/* Performance */}
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Performance
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <AnalyticsCard
                icon={<Users className="size-5" />}
                label="Avg Party Size"
                value={analytics.avgGuests}
                suffix=" guests"
                color="text-muted-foreground bg-muted"
              />
              <AnalyticsCard
                icon={<TrendingDown className="size-5" />}
                label="Cancellation Rate"
                value={analytics.cancellationRate}
                suffix="%"
                color={analytics.cancellationRate > 20 ? "text-destructive bg-destructive/10" : "text-emerald-600 bg-emerald-500/10"}
              />
              <AnalyticsCard
                icon={<UserX className="size-5" />}
                label="No Show Rate"
                value={analytics.noShowRate}
                suffix="%"
                color={analytics.noShowRate > 10 ? "text-orange-600 bg-orange-500/10" : "text-emerald-600 bg-emerald-500/10"}
              />
              {analytics.peakHour && (
                <AnalyticsCard
                  icon={<Clock className="size-5" />}
                  label="Peak Hour"
                  value={analytics.peakHour}
                  color="text-primary bg-primary/10"
                  isText
                />
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function AnalyticsCard({
  icon,
  label,
  value,
  color,
  suffix,
  isText,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  suffix?: string;
  isText?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className={`grid size-10 place-items-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <div className={`${isText ? "text-lg" : "text-2xl"} font-bold tabular-nums`}>
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
