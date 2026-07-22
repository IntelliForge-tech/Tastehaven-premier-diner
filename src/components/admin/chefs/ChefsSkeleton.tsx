import { Skeleton } from "@/components/ui/skeleton";

interface ChefsSkeletonProps {
  /** Number of placeholder rows. Defaults to 4. */
  rows?: number;
}

/** Loading placeholder matching ChefRow's shape (avatar + name/bio left, badges/actions right). */
export function ChefsSkeleton({ rows = 4 }: ChefsSkeletonProps) {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-b-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-52" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
