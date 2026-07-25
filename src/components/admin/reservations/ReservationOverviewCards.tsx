import {
  CalendarCheck,
  CalendarClock,
  CheckCircle,
  Clock,
  TrendingUp,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

import type { ReservationAnalytics } from "@/services/reservations.service";

interface ReservationOverviewCardsProps {
  analytics: ReservationAnalytics;
}

export function ReservationOverviewCards({ analytics }: ReservationOverviewCardsProps) {
  const cards = [
    {
      label: "Today",
      value: analytics.today,
      icon: CalendarCheck,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Tomorrow",
      value: analytics.tomorrow,
      icon: CalendarClock,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "This Week",
      value: analytics.thisWeek,
      icon: TrendingUp,
      color: "text-violet-500 bg-violet-500/10",
    },
    {
      label: "Pending",
      value: analytics.pending,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-500/10",
    },
    {
      label: "Confirmed",
      value: analytics.confirmed,
      icon: CheckCircle,
      color: "text-green-600 bg-green-500/10",
    },
    {
      label: "Checked In",
      value: analytics.checkedIn + analytics.seated,
      icon: Users,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Completed",
      value: analytics.completed,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Cancelled",
      value: analytics.cancelled,
      icon: XCircle,
      color: "text-destructive bg-destructive/10",
    },
    {
      label: "No Show",
      value: analytics.noShow,
      icon: UserX,
      color: "text-orange-600 bg-orange-500/10",
    },
    {
      label: "Avg Guests",
      value: analytics.avgGuests,
      icon: Users,
      color: "text-muted-foreground bg-muted",
      suffix: " pax",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
          >
            <div className={`grid size-8 place-items-center rounded-lg ${card.color}`}>
              <Icon className="size-4" />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">
                {card.value}
                {card.suffix && (
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {card.suffix}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
