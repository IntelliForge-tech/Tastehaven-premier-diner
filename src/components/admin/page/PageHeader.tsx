import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  /** Typically an <ActionBar />. Optional so this stays reusable for headers with no action. */
  action?: ReactNode;
}

/** Title + short description + optional primary action, for the top of every admin CMS page. Stacks on mobile, sits side-by-side from `sm` up. */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
