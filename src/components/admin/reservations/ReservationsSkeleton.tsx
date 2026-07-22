import { Skeleton } from "@/components/ui/skeleton";

interface ReservationsSkeletonProps {
  rows?: number;
}

/**
 * Loading skeleton matching the Reservations table's column layout:
 * customer (name + email + phone), date/time, party, status, request,
 * created, actions. Hidden columns at smaller breakpoints are
 * consistently handled.
 */
export function ReservationsSkeleton({ rows = 5 }: ReservationsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i} className="border-b border-border last:border-b-0">
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-32 mb-1" />
            <Skeleton className="h-3 w-44" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </td>
          <td className="px-4 py-3 text-center">
            <Skeleton className="h-4 w-6 mx-auto" />
          </td>
          <td className="px-4 py-3">
            <Skeleton className="h-5 w-20 rounded-full" />
          </td>
          <td className="px-4 py-3 hidden lg:table-cell">
            <Skeleton className="h-3 w-36" />
          </td>
          <td className="px-4 py-3 hidden xl:table-cell">
            <Skeleton className="h-3 w-24" />
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1.5 justify-end">
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
              <Skeleton className="size-8 rounded-md" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
