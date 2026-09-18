/**
 * Supabase connection details.
 *
 * There is deliberately no service-role key here. Content is public to read,
 * lead writes go through a SECURITY DEFINER function, and everything in the
 * admin runs as the signed-in user, so the publishable key plus RLS covers the
 * whole app. Nothing secret ships to the browser or sits in the environment.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "";

/** Table prefix: this schema shares a database with another application. */
export const T = {
  brands: "mhs_brands",
  services: "mhs_services",
  cities: "mhs_cities",
  niches: "mhs_niches",
  leads: "mhs_leads",
} as const;

export function hasSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}

/** Kept as an alias so call sites read clearly; both need the same two values. */
export const hasPublicSupabase = hasSupabase;
