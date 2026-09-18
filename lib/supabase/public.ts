import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, hasSupabase } from "./env";

/**
 * Sessionless server-side client using the publishable key.
 *
 * Runs as the `anon` role, so it can read public content and call the lead
 * function, and nothing else. Anything that must see or change private data
 * uses createServerSupabase(), which carries the signed-in user.
 */
export function createPublicClient() {
  if (!hasSupabase()) {
    throw new Error("Supabase is not configured");
  }
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
