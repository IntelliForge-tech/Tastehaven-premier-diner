/**
 * Browser (client-side) Supabase client.
 *
 * Uses the anon key only — every query made through this client is subject
 * to the RLS policies from the second migration exactly as an anonymous or
 * logged-in visitor would experience them. This client never sees the
 * service-role key, and none of this project's server-only secrets pass
 * through it.
 *
 * Scope note: this file only sets up the connection. It does not implement
 * sign-in/sign-out or session handling — that's the Authentication phase.
 */

import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Returns a singleton Supabase client for use in browser/component code.
 * Reuses one instance per page load instead of creating a new client (and
 * a new realtime/auth listener) on every call.
 */
export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your project's values.",
    );
  }

  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
