import { Skeleton } from "@/components/ui/skeleton";

interface OffersSkeletonProps {
  /** Number of placeholder rows. Defaults to 4. */
  rows?: number;
}

/** Loading placeholder matching OfferRow's shape (icon + title/desc left, badge/actions right). */
export function OffersSkeleton({ rows = 4 }: OffersSkeletonProps) {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-b-0"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-64" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
