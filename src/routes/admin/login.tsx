import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";

import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { Card } from "@/components/common/Card";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({
    meta: [{ title: "Admin Login — Taste Haven" }],
  }),
});

/**
 * Admin login page.
 *
 * Login logic is wired to real Supabase Authentication (see
 * AdminLoginForm + src/services/auth/auth.service.ts). Route protection
 * has now landed (see src/routes/admin/_authenticated.tsx): an already
 * signed-in visitor who lands here is redirected to /admin, client-side,
 * once the session finishes restoring. This route itself is otherwise
 * unchanged and still isn't linked to from the public site.
 *
 * A <Toaster /> is mounted here because this route is not nested under
 * the homepage's own Toaster (routes/index.tsx mounts one only for
 * itself) — without one on this page, AdminLoginForm's error/success
 * toasts would silently have nowhere to render.
 */
function AdminLogin() {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate({ to: "/admin", replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12 text-foreground">
      <div className="absolute inset-0 bg-radial-hero" aria-hidden="true" />
      <Toaster richColors position="top-right" />

      <Card className="relative w-full max-w-md p-8 shadow-card md:p-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-utensils text-lg text-primary" aria-hidden="true" />
            <span className="font-display text-xl font-semibold tracking-wide">
              Taste <span className="text-gradient-gold">Haven</span>
            </span>
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold md:text-3xl">Admin Portal</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Sign in to manage your restaurant.</p>
        </div>

        <div className="divider-gold my-7" />

        <AdminLoginForm />
      </Card>
    </div>
  );
}
