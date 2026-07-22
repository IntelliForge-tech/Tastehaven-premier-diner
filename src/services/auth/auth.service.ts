import type { AuthError, Session, User } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Authentication service.
 *
 * This is the ONLY file that imports the Supabase client for auth
 * purposes. UI components (AdminLoginForm, etc.) call the functions
 * exported here and never touch `supabase.auth` themselves — they get
 * back a small, UI-safe result type instead of a raw Supabase response,
 * so the UI never has to know Supabase is involved at all, and never
 * renders a raw Supabase error message.
 */

export type AuthErrorCode = "invalid_credentials" | "network_error" | "unexpected_error";

export interface AuthServiceError {
  code: AuthErrorCode;
  /** Friendly, user-safe text. Never the raw Supabase error message. */
  message: string;
}

export type SignInResult = { success: true } | { success: false; error: AuthServiceError };

export interface SignInParams {
  email: string;
  password: string;
  /**
   * Whether the session should persist across browser restarts.
   *
   * TODO(remember-me): not yet honored — intentionally.
   *
   * The browser Supabase client (src/lib/supabase/client.ts) is a
   * memoized singleton created once via `createBrowserClient`, with a
   * single storage/persistence strategy fixed at construction time.
   * supabase-js v2's `signInWithPassword()` has no per-call option to
   * make one sign-in persistent and another session-only — that
   * behavior is controlled entirely by the storage adapter the client
   * was built with, not by anything passed to this call.
   *
   * Cleanly honoring "don't remember me" would mean swapping the
   * client's storage (e.g. to sessionStorage or an in-memory adapter)
   * for that one login, which conflicts with today's singleton client
   * and with the SSR cookie-based session flow the /admin/* route guard
   * will need in the next phase. A post-hoc workaround — signing in
   * normally and then manually clearing localStorage/cookies right
   * after — was deliberately avoided: it doesn't reliably prevent
   * persistence (closing the tab before the cleanup runs still leaves a
   * persisted session behind), which is exactly the kind of unsafe
   * shortcut this step asked not to introduce.
   *
   * For now, every sign-in uses the client's default (persistent)
   * behavior regardless of this flag. Revisit once the session/cookie
   * architecture for route protection is designed.
   */
  rememberMe: boolean;
}

export async function signInWithPassword({ email, password }: SignInParams): Promise<SignInResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return { success: true };
  } catch (err) {
    // Anything thrown before/outside supabase-js's own error handling —
    // most commonly a fetch()-level TypeError when the network is
    // unreachable (offline, DNS failure, CORS, host down).
    return { success: false, error: mapUnexpectedError(err) };
  }
}

/** Alias of SignInResult, used where "sign in" isn't the accurate name. */
export type AuthActionResult = SignInResult;

/**
 * Returns the currently restored session (if any), or null if there is
 * none / it couldn't be restored. Used by AuthProvider on startup to
 * populate initial auth state — never called directly from a component.
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("[auth.service] getSession failed:", error.message);
    return null;
  }

  return data.session;
}

/**
 * Returns the current authenticated user (if any), re-verified against
 * Supabase Auth rather than trusted from local storage alone.
 */
export async function getUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // "Auth session missing!" is Supabase's expected response when no one
    // is logged in — not a failure worth logging, just "no user".
    if (error.message !== "Auth session missing!") {
      console.error("[auth.service] getUser failed:", error.message);
    }
    return null;
  }

  return data.user;
}

/** Signs the current user out. */
export async function signOut(): Promise<AuthActionResult> {
  try {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: mapAuthError(error) };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: mapUnexpectedError(err) };
  }
}

/**
 * Subscribes to Supabase Auth state changes (sign-in, sign-out, token
 * refresh, etc.) and returns an unsubscribe function.
 *
 * This exists so AuthProvider never needs to import the Supabase client
 * or call `supabase.auth.onAuthStateChange` itself — it goes through this
 * one function instead, keeping the client fully encapsulated in this
 * service file.
 */
export function onAuthStateChange(callback: (session: Session | null) => void): () => void {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

function mapAuthError(error: AuthError): AuthServiceError {
  const message = error.message?.toLowerCase() ?? "";

  // supabase-js returns fetch-level failures through this same `error`
  // field in most environments, typically with no HTTP status attached.
  if (!error.status) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  if (error.status === 429) {
    return {
      code: "unexpected_error",
      message: "Too many sign-in attempts. Please wait a moment and try again.",
    };
  }

  if (error.status === 400 || error.status === 401 || message.includes("invalid login credentials")) {
    return {
      code: "invalid_credentials",
      message: "Incorrect email or password. Please try again.",
    };
  }

  return {
    code: "unexpected_error",
    message: "Something went wrong on our end. Please try again in a moment.",
  };
}

function mapUnexpectedError(err: unknown): AuthServiceError {
  // fetch() throws a TypeError specifically for network-level failures
  // that occur before any response is received.
  if (err instanceof TypeError) {
    return {
      code: "network_error",
      message: "We couldn't reach the server. Check your internet connection and try again.",
    };
  }

  return {
    code: "unexpected_error",
    message: "Something went wrong. Please try again.",
  };
}
