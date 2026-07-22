import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardCardSkeletonProps {
  /** Number of placeholder content lines below the title. Defaults to 3. */
  lines?: number;
  className?: string;
}

/**
 * Loading placeholder matching DashboardCard's shape (title bar + a few
 * content lines). Not wired to anything yet — drop this in for whatever
 * DashboardCard-wrapped section starts fetching real data next.
 */
export function DashboardCardSkeleton({ lines = 3, className }: DashboardCardSkeletonProps) {
  return (
    <Card className={cn("p-6", className)}>
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="space-y-2.5">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${85 - i * 15}%` }} />
        ))}
      </div>
    </Card>
  );
}
