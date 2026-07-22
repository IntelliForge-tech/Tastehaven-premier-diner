import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface SidebarItemBaseProps {
  icon: LucideIcon;
  label: string;
  /**
   * Forces the label to render regardless of viewport width. The desktop
   * `Sidebar` collapses to icon-only at the `md` breakpoint (labels only
   * reappear at `lg`), but `MobileSidebar` renders inside an overlay
   * that's only ever shown below `md` in the first place, so it always
   * wants full labels — hence the override.
   */
  alwaysShowLabel?: boolean;
}

type SidebarItemProps =
  | (SidebarItemBaseProps & {
      to: string;
      exact?: boolean;
      onClick?: never;
      /** Fires after navigation — used by MobileSidebar to close the drawer. */
      onNavigate?: () => void;
    })
  | (SidebarItemBaseProps & {
      to?: never;
      exact?: never;
      onClick: () => void;
      onNavigate?: never;
    });

const baseClassName =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/**
 * A single sidebar row. Renders as a `<Link>` (with automatic
 * active-route highlighting) when given `to`, or as a `<button>` when
 * given `onClick` — used for the one non-navigable row, Logout.
 */
export function SidebarItem({
  icon: Icon,
  label,
  alwaysShowLabel,
  to,
  exact,
  onClick,
  onNavigate,
}: SidebarItemProps) {
  const labelClassName = alwaysShowLabel ? "inline" : "hidden lg:inline";

  if (to) {
    return (
      <Link
        to={to}
        onClick={onNavigate}
        aria-label={label}
        activeOptions={{ exact: Boolean(exact) }}
        activeProps={{ className: "bg-primary/10 text-primary", "aria-current": "page" }}
        inactiveProps={{
          className: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        }}
        className={baseClassName}
      >
        <Icon className="size-[18px] shrink-0" aria-hidden="true" />
        <span className={labelClassName}>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        baseClassName,
        "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      <span className={labelClassName}>{label}</span>
    </button>
  );
}
