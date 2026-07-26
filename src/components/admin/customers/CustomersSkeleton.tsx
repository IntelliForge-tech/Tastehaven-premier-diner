/**
 * Loading skeleton for the Customers table — mirrors ReservationsSkeleton
 * in structure and column count.
 */
export function CustomersSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-border animate-pulse">
          <td className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 rounded bg-muted" />
                <div className="h-3 w-40 rounded bg-muted" />
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="h-5 w-16 rounded-full bg-muted" />
          </td>
          <td className="px-4 py-3 text-center">
            <div className="mx-auto h-4 w-6 rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 w-16 rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="h-5 w-14 rounded-full bg-muted" />
          </td>
          <td className="px-4 py-3 hidden lg:table-cell">
            <div className="h-3.5 w-24 rounded bg-muted" />
          </td>
          <td className="px-4 py-3">
            <div className="flex justify-end gap-1.5">
              <div className="size-8 rounded-full bg-muted" />
              <div className="size-8 rounded-full bg-muted" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
