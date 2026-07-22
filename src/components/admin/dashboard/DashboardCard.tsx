import type { ReactNode } from "react";

import { Card } from "@/components/common/Card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/** Generic titled section card — wraps "Recent Activity", "Quick Actions", etc. on the dashboard home. */
export function DashboardCard({ title, description, children, className }: DashboardCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {children}
    </Card>
  );
}
