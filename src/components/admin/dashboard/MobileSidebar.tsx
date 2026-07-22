import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

import { ADMIN_NAV_ITEMS } from "@/components/admin/dashboard/nav-config";
import { SidebarItem } from "@/components/admin/dashboard/SidebarItem";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileSidebarProps {
  onLogout: () => void;
}

/**
 * Slide-over nav drawer for below the `md` breakpoint. Owns its own
 * open/close state and renders its own hamburger trigger (hidden at
 * `md`+, where the fixed `Sidebar` takes over instead) so `TopNavbar`
 * doesn't need to manage drawer state itself.
 *
 * Built on the existing `ui/sheet.tsx` (Radix Dialog under the hood),
 * so Escape-to-close and focus trapping come for free.
 */
export function MobileSidebar({ onLogout }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  const closeAndRun = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open admin navigation"
          className="grid size-9 place-items-center rounded-lg text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="flex w-64 flex-col bg-card p-0">
        <SheetHeader className="h-16 justify-center border-b border-border px-4">
          <SheetTitle className="font-display text-lg font-semibold text-foreground">
            Taste Haven
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label="Admin navigation">
          {ADMIN_NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.to}
              {...item}
              alwaysShowLabel
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>

        <div className="border-t border-border p-2">
          <SidebarItem
            icon={LogOut}
            label="Logout"
            alwaysShowLabel
            onClick={closeAndRun(onLogout)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
