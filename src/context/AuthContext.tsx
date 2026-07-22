import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

/**
 * Shape of the auth state exposed to the rest of the app. Deliberately
 * narrow — just the four fields this phase calls for. No setters are
 * exposed here: only AuthProvider is allowed to change this state: the
 * UI only ever reads it via useAuth().
 */
export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * No default value: `undefined` lets useAuth() detect "used outside an
 * AuthProvider" and fail loudly instead of silently returning empty state.
 */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
