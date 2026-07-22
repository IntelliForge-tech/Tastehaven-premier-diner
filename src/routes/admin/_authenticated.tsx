import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/_authenticated")({
  component: AuthenticatedLayout,
});

/**
 * Route guard for every protected /admin/* route (everything nested under
 * this pathless layout — NOT /admin/login, which lives outside it).
 *
 * Scope note: this is a CLIENT-SIDE guard only. `AuthProvider` restores
 * session state via the browser Supabase client after mount, so on the
 * very first server-rendered response `loading` is always true and this
 * component renders nothing but the loading state — never protected
 * content, and never an incorrect redirect for an already-authenticated
 * user. Once the client finishes restoring the session (`loading` turns
 * false), an unauthenticated visitor is redirected to /admin/login and an
 * authenticated one sees the nested route via <Outlet />, wrapped in the
 * shared AdminLayout shell (sidebar + top navbar + content area).
 *
 * A cookie-aware SSR check (so the server itself can redirect before
 * sending any HTML) is separate, later work — see "SSR auth
 * cookies/middleware" in the project handoff's Not Yet Implemented list.
 */
function AuthenticatedLayout() {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
