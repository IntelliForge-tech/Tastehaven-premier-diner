/**
 * Server-side Supabase client, for use inside TanStack Start server
 * functions and route loaders (SSR).
 *
 * Uses the anon key, same as the browser client — server-rendered queries
 * are subject to the exact same RLS policies a public visitor would get.
 * This deliberately does NOT read the request's auth cookies or forward a
 * logged-in session, and it does NOT use the service-role key. Wiring a
 * session-aware server client (so an authenticated admin's SSR requests
 * pass their identity through to Supabase, and support for privileged
 * service-role operations) is Authentication-phase work, out of scope for
 * this client-integration step.
 *
 * `persistSession`/`autoRefreshToken` are disabled because a server client
 * is created fresh per request — there is no long-lived browser tab for a
 * refresh timer to live in, and nothing to persist a session to.
 */

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

export function getSupabaseServerClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your project's values.",
    );
  }

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
