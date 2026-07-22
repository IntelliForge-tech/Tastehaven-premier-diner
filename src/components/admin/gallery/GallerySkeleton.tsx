import { Skeleton } from "@/components/ui/skeleton";

interface GallerySkeletonProps {
  /** Number of placeholder cards. Defaults to 8 — enough to fill a few grid rows. */
  count?: number;
}

/** Loading placeholder matching GalleryGrid/GalleryCard's shape (image + two text lines). */
export function GallerySkeleton({ count = 8 }: GallerySkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-border bg-card">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
