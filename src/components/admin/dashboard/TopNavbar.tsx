import { useRouterState } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";

import { MobileSidebar } from "@/components/admin/dashboard/MobileSidebar";
import { UserMenu } from "@/components/admin/dashboard/UserMenu";

interface TopNavbarProps {
  user: User | null;
  onLogout: () => void;
}

/**
 * Maps a pathname to the page title shown in the top bar. Add an entry
 * here whenever a new admin page is built.
 */
const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/menu": "Menu",
  "/admin/gallery": "Gallery",
  "/admin/reservations": "Reservations",
  "/admin/testimonials": "Testimonials",
  "/admin/chefs": "Chefs",
  "/admin/offers": "Offers",
  "/admin/faq": "FAQ",
  "/admin/messages": "Contact Messages",
  "/admin/settings": "Restaurant Settings",
};

export function TopNavbar({ user, onLogout }: TopNavbarProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const title = PAGE_TITLES[pathname] ?? "Admin";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <MobileSidebar onLogout={onLogout} />
        <h1 className="font-display text-lg font-semibold text-foreground">{title}</h1>
      </div>

      <UserMenu user={user} onLogout={onLogout} />
    </header>
  );
}
