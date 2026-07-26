import {
  AlertCircle, Calendar, Clock, Gift, Star, TrendingUp, UserCheck, Users, Building2,
} from "lucide-react";

import { StaffAvatar } from "@/components/admin/staff/StaffAvatar";
import { StatsCard } from "@/components/admin/dashboard/StatsCard";
import type { StaffAnalytics } from "@/services/staff/staff-analytics.service";

interface StaffAnalyticsCardsProps {
  analytics: StaffAnalytics;
}

export function StaffAnalyticsCards({ analytics }: StaffAnalyticsCardsProps) {
  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatsCard label="Total Employees"  value={analytics.totalEmployees}  icon={Users} />
        <StatsCard label="Active"           value={analytics.activeEmployees} icon={UserCheck} />
        <StatsCard label="On Leave"         value={analytics.onLeave}         icon={Clock} />
        <StatsCard label="Departments"      value={analytics.departmentCount} icon={Building2} />
        <StatsCard label="Present Today"    value={analytics.todayPresent}    icon={TrendingUp} />
        <StatsCard label="Late Today"       value={analytics.todayLate}       icon={AlertCircle} />
        <StatsCard label="Absent Today"     value={Math.max(0, analytics.todayAbsent)} icon={AlertCircle} />
      </div>

      {/* Upcoming birthdays */}
      {analytics.upcomingBirthdays.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <Gift className="size-4 text-primary" />
            Upcoming Birthdays (next 30 days)
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.upcomingBirthdays.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                <StaffAvatar firstName={m.firstName} lastName={m.lastName} photoUrl={m.profilePhotoUrl} size="sm" />
                <div>
                  <p className="text-sm font-medium text-foreground">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming work anniversaries */}
      {analytics.upcomingAnniversaries.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-base font-semibold text-foreground">
            <Calendar className="size-4 text-primary" />
            Work Anniversaries (next 30 days)
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {analytics.upcomingAnniversaries.map((m) => {
              const years = new Date().getFullYear() - new Date(m.joiningDate).getFullYear();
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                  <StaffAvatar firstName={m.firstName} lastName={m.lastName} photoUrl={m.profilePhotoUrl} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.firstName} {m.lastName}</p>
                    <p className="text-xs text-muted-foreground">{years} year{years !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Longest serving */}
      {analytics.longestServing && (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Star className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Longest Serving Employee</p>
            <p className="font-display text-lg font-semibold text-foreground">
              {analytics.longestServing.firstName} {analytics.longestServing.lastName}
            </p>
            <p className="text-sm text-muted-foreground">
              Since {new Date(analytics.longestServing.joiningDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
