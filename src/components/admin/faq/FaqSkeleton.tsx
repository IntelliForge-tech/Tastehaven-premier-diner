export function FaqSkeleton() {
  return (
    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading FAQs">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
          <div className="size-8 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
          </div>
          <div className="flex gap-1.5">
            <div className="size-8 rounded-md bg-muted" />
            <div className="size-8 rounded-md bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
