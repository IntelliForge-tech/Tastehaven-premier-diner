import { cn } from "@/lib/utils";
import type { LoyaltyTier } from "@/services/customers.service";
import { LOYALTY_THRESHOLDS } from "@/services/customers.service";

interface LoyaltyBadgeProps {
  tier: LoyaltyTier;
  size?: "sm" | "md";
}

const TIER_CONFIG: Record<LoyaltyTier, { label: string; className: string; icon: string }> = {
  bronze: {
    label: "Bronze",
    className: "bg-amber-900/20 text-amber-700 border-amber-700/30",
    icon: "🥉",
  },
  silver: {
    label: "Silver",
    className: "bg-slate-200/40 text-slate-600 border-slate-400/40 dark:text-slate-300 dark:border-slate-500/40",
    icon: "🥈",
  },
  gold: {
    label: "Gold",
    className: "bg-yellow-400/20 text-yellow-700 border-yellow-500/40 dark:text-yellow-400",
    icon: "🥇",
  },
  platinum: {
    label: "Platinum",
    className: "bg-cyan-400/20 text-cyan-700 border-cyan-500/40 dark:text-cyan-400",
    icon: "💎",
  },
  diamond: {
    label: "Diamond",
    className: "bg-violet-400/20 text-violet-700 border-violet-500/40 dark:text-violet-400",
    icon: "👑",
  },
};

export function LoyaltyBadge({ tier, size = "md" }: LoyaltyBadgeProps) {
  const config = TIER_CONFIG[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        config.className,
      )}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}

interface LoyaltyProgressProps {
  tier: LoyaltyTier;
  lifetimePoints: number;
}

const TIER_ORDER: LoyaltyTier[] = ["bronze", "silver", "gold", "platinum", "diamond"];

export function LoyaltyProgress({ tier, lifetimePoints }: LoyaltyProgressProps) {
  const currentIdx = TIER_ORDER.indexOf(tier);
  const nextTier = currentIdx < TIER_ORDER.length - 1 ? TIER_ORDER[currentIdx + 1] : null;

  if (!nextTier) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Maximum tier reached</span>
          <span className="font-medium text-foreground">{lifetimePoints.toLocaleString()} pts</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full rounded-full bg-violet-500" />
        </div>
      </div>
    );
  }

  const current = LOYALTY_THRESHOLDS[tier];
  const next = LOYALTY_THRESHOLDS[nextTier];
  const progress = Math.min(100, ((lifetimePoints - current) / (next - current)) * 100);
  const remaining = next - lifetimePoints;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground capitalize">{nextTier} in {remaining.toLocaleString()} pts</span>
        <span className="font-medium text-foreground">{lifetimePoints.toLocaleString()} pts</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
