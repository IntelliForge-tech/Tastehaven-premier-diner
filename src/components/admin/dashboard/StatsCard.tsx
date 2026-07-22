import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/common/Card";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
}

/** A single quick-stat tile (e.g. "Menu Items — 0"). Value is a placeholder until a later phase wires real counts; see StatsCardSkeleton for the loading state. */
export function StatsCard({ label, value, icon: Icon }: StatsCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
