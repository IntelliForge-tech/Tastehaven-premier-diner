import { Card } from "@/components/common/Card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading placeholder matching StatsCard's exact footprint (icon tile +
 * value + label). Not wired to anything yet — for the later phase that
 * fetches real counts and needs a loading state to show while it does.
 */
export function StatsCardSkeleton() {
  return (
    <Card className="flex items-center gap-4 p-5">
      <Skeleton className="size-11 shrink-0 rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-4 w-20" />
      </div>
    </Card>
  );
}
