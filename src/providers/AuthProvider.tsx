import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { AuthContext, type AuthContextValue } from "@/context/AuthContext";
import { getSession, onAuthStateChange } from "@/services/auth/auth.service";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Restores and exposes authentication state for the rest of the app.
 *
 * Scope note: this ONLY restores/exposes auth state — user, session,
 * loading, isAuthenticated. It does not protect any route, redirect
 * anyone, render a dashboard/layout, or touch CRUD pages. All of that is
 * separate, later work. This component never imports the Supabase client
 * itself; every call goes through auth.service.ts.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Restore whatever session already exists (e.g. from a previous
    // visit) before anything downstream renders based on auth state.
    getSession().then((restoredSession) => {
      if (!isMounted) return;
      setSession(restoredSession);
      setUser(restoredSession?.user ?? null);
      setLoading(false);
    });

    // Keep state in sync with sign-in, sign-out, and token refresh
    // events happening anywhere in the app from this point forward.
    const unsubscribe = onAuthStateChange((nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: session !== null,
    }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
