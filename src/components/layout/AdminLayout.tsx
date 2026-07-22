import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/admin/dashboard/Sidebar";
import { TopNavbar } from "@/components/admin/dashboard/TopNavbar";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/auth/auth.service";

interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Shared shell for every authenticated /admin/* page: fixed sidebar
 * (md+) / slide-over drawer (below md) + top navbar + content area.
 * Rendered once, from src/routes/admin/_authenticated.tsx, so every
 * nested route gets it automatically without repeating layout markup.
 *
 * Owns the single logout action: calls auth.service.ts's signOut()
 * (never touches Supabase directly) and, once resolved, navigates to
 * /admin/login. Passed down to both Sidebar/MobileSidebar's Logout row
 * and UserMenu's dropdown — one code path, not two.
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    void signOut().finally(() => {
      navigate({ to: "/admin/login", replace: true });
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} className="hidden md:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
