import { Skeleton } from "@/components/ui/skeleton";

interface TestimonialsSkeletonProps {
  /** Number of placeholder rows. Defaults to 5. */
  rows?: number;
}

/** Loading placeholder matching TestimonialRow's shape (avatar + name/role/stars left, badges/date/actions right). */
export function TestimonialsSkeleton({ rows = 5 }: TestimonialsSkeletonProps) {
  return (
    <div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-start gap-3 border-b border-border py-4 last:border-b-0">
          {/* Avatar */}
          <Skeleton className="size-10 shrink-0 rounded-full" />

          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-64" />
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
