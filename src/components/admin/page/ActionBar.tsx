import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/common/Button";

interface ActionBarProps {
  label: string;
  icon: LucideIcon;
  /**
   * Optional — omit to keep this visual-only, as every placeholder CMS
   * page still does. Phase 6B is the first page to pass one (Menu's
   * "Add Menu Item" navigates to /admin/menu/new).
   */
  onClick?: () => void;
}

/**
 * The one primary action button on a CMS page (e.g. "Add Menu Item").
 * Inert by default (no onClick) for pages that haven't wired a create
 * flow yet; pass onClick once a page has one.
 */
export function ActionBar({ label, icon: Icon, onClick }: ActionBarProps) {
  return (
    <Button
      type="button"
      variant="gold"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2.5"
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
