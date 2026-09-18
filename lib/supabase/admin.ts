import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SECRET_KEY, SUPABASE_URL, hasServiceSupabase } from "./env";

/**
 * Service-role client. Bypasses RLS, so it is only ever constructed on the
 * server and never handed to a client component.
 */
export function createAdminClient() {
  if (!hasServiceSupabase()) {
    throw new Error("Supabase service credentials are not configured");
  }
  return createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
