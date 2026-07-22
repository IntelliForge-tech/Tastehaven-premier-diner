import { useContext } from "react";

import { AuthContext, type AuthContextValue } from "@/context/AuthContext";

/**
 * Reads the current auth state (user, session, loading, isAuthenticated).
 * This is the only way UI code should ever touch auth state — components
 * never import auth.service.ts or the Supabase client directly.
 *
 * Throws if used outside an AuthProvider, so a missing provider fails
 * immediately and obviously rather than silently returning empty state.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth() must be used within an <AuthProvider>.");
  }

  return context;
}
