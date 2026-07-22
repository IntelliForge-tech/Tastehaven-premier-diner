/**
 * One-off connection check — NOT application code, no CRUD, no UI.
 *
 * Confirms that:
 *   1. The two env vars are set and readable.
 *   2. The Supabase client can reach the project.
 *   3. A public, RLS-protected table can be read with the anon key
 *      (proving both connectivity AND that the public SELECT policy
 *      from the RLS migration is working as expected).
 *
 * Run with:
 *   bun scripts/verify-supabase-connection.ts
 *
 * (If not using Bun, run with Node's built-in env-file flag instead:
 *   node --env-file=.env --experimental-strip-types scripts/verify-supabase-connection.ts )
 */

import { getSupabaseServerClient } from "../src/lib/supabase/server";

async function main() {
  console.log("Checking Supabase connection...");

  const supabase = getSupabaseServerClient();

  const { data, error, status } = await supabase
    .from("restaurant_info")
    .select("id")
    .limit(1);

  if (error) {
    console.error("❌ Supabase connection check failed.");
    console.error(`   HTTP status: ${status}`);
    console.error(`   ${error.message}`);
    process.exit(1);
  }

  console.log("✅ Connected to Supabase successfully.");
  console.log(
    data && data.length > 0
      ? "   restaurant_info has at least one row."
      : "   restaurant_info table is reachable but currently empty (expected before Phase 4 content is added).",
  );
}

main();
