import { LogOut } from "lucide-react";

import { ADMIN_NAV_ITEMS } from "@/components/admin/dashboard/nav-config";
import { SidebarItem } from "@/components/admin/dashboard/SidebarItem";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onLogout: () => void;
  className?: string;
}

/**
 * Fixed desktop sidebar (`md` and up). Icon-only between `md` and `lg`
 * (see `SidebarItem`'s own label-visibility logic), full icon+label at
 * `lg`+. Hidden entirely below `md` — `MobileSidebar` covers that range
 * with a slide-over drawer instead.
 */
export function Sidebar({ onLogout, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex w-16 shrink-0 flex-col border-r border-border bg-card lg:w-64",
        className,
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-center border-b border-border lg:justify-start lg:px-4">
        <span className="font-display text-lg font-semibold text-primary" aria-hidden="true">
          TH
        </span>
        <span className="hidden font-display text-lg font-semibold text-foreground lg:ml-2 lg:inline">
          Taste Haven
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label="Admin navigation">
        {ADMIN_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <SidebarItem icon={LogOut} label="Logout" onClick={onLogout} />
      </div>
    </aside>
  );
}
