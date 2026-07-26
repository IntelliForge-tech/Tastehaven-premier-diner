import { Crown, Shield, Users, Zap } from "lucide-react";
import type { Role } from "@/services/roles.service";
import type { StaffWithRoles } from "@/services/staff-roles.service";

interface RoleAnalyticsCardsProps {
  roles: Role[];
  staff: StaffWithRoles[];
}

export function RoleAnalyticsCards({ roles, staff }: RoleAnalyticsCardsProps) {
  const totalRoles = roles.length;
  const systemRoles = roles.filter((r) => r.isSystem).length;
  const customRoles = totalRoles - systemRoles;
  const activeRoles = roles.filter((r) => r.isActive).length;

  // Staff assigned at least one role
  const assignedStaff = staff.filter((s) => s.roles.length > 0).length;

  // Most used role
  const roleCounts = new Map<string, number>();
  staff.forEach((s) => s.roles.forEach((r) => roleCounts.set(r.name, (roleCounts.get(r.name) ?? 0) + 1)));
  const mostUsed = [...roleCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  // Unused roles
  const usedRoleNames = new Set(staff.flatMap((s) => s.roles.map((r) => r.name)));
  const unusedRoles = roles.filter((r) => !usedRoleNames.has(r.name)).length;

  const cards = [
    { label: "Total Roles", value: totalRoles, icon: Shield, color: "text-primary bg-primary/10" },
    { label: "System Roles", value: systemRoles, icon: Crown, color: "text-yellow-600 bg-yellow-500/10" },
    { label: "Custom Roles", value: customRoles, icon: Zap, color: "text-violet-600 bg-violet-500/10" },
    { label: "Active Roles", value: activeRoles, icon: Shield, color: "text-green-600 bg-green-500/10" },
    { label: "Staff Assigned", value: assignedStaff, icon: Users, color: "text-blue-600 bg-blue-500/10" },
    { label: "Unused Roles", value: unusedRoles, icon: Shield, color: "text-muted-foreground bg-muted" },
    {
      label: "Most Used Role",
      value: mostUsed ? `${mostUsed[0]} (${mostUsed[1]})` : "—",
      icon: Crown, color: "text-emerald-600 bg-emerald-500/10", isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className={`grid size-9 place-items-center rounded-lg ${card.color}`}>
              <Icon className="size-4" />
            </div>
            <div>
              <div className={`font-bold tabular-nums ${card.isText ? "text-sm" : "text-2xl"}`}>
                {card.value}
              </div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
