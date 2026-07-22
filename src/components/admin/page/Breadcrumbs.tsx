import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface BreadcrumbsProps {
  /** The current page's label — the trailing, non-link crumb. */
  page: string;
}

/**
 * "Dashboard > {page}" breadcrumb trail for every admin CMS page below
 * the dashboard home. Only two levels deep by design — every admin
 * page today sits directly under /admin, so a generic arbitrary-depth
 * trail isn't needed yet. The Dashboard crumb links to the one admin
 * route that's guaranteed to exist and be type-checked (`/admin`),
 * rather than accepting an arbitrary `to` string, which TanStack
 * Router's typed routing wouldn't accept without a cast.
 */
export function Breadcrumbs({ page }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Link to="/admin" className="transition-colors hover:text-foreground">
        Dashboard
      </Link>
      <ChevronRight className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="font-medium text-foreground" aria-current="page">
        {page}
      </span>
    </nav>
  );
}
