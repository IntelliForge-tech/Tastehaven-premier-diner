import { Skeleton } from "@/components/ui/skeleton";

interface MenuItemsSkeletonProps {
  /** Number of placeholder rows. Defaults to 5. */
  rows?: number;
}

/** Loading placeholder matching MenuItemRow's shape (name/category left, badges/price right). */
export function MenuItemsSkeleton({ rows = 5 }: MenuItemsSkeletonProps) {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-b-0"
        >
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
