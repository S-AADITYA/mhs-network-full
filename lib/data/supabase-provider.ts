import "server-only";
import { T, hasSupabase } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import type { Brand, City, Faq, Network, Niche, Service } from "@/lib/types";

export function supabaseDataConfigured(): boolean {
  return hasSupabase() && process.env.CONTENT_SOURCE !== "config";
}

interface Row {
  brand_key: string;
}

interface BrandRow {
  key: string;
  name: string;
  domain: string;
  phone: string;
  accent: string;
  central: boolean;
  tagline: string;
  pattern: Brand["pattern"];
  network_name: string | null;
  ga4_id: string | null;
}

interface ServiceRow extends Row {
  slug: string;
  name: string;
  short: string;
  hero: string;
  intro: string;
  includes: unknown;
  why: string;
  from: string;
  faqs: unknown;
}

interface CityRow extends Row {
  slug: string;
  name: string;
  region: string;
  tier: string;
  known_for: string;
  note: string | null;
}

interface NicheRow extends Row {
  slug: string;
  name: string;
  line: string;
}

/** jsonb columns arrive as unknown; coerce them to the shapes pages expect. */
function toStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.map((v) => String(v)) : [];
}

function toFaqs(value: unknown): Faq[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((f): f is Record<string, unknown> => typeof f === "object" && f !== null)
    .map((f) => ({ q: String(f.q ?? ""), a: String(f.a ?? "") }))
    .filter((f) => f.q && f.a);
}

function groupByBrand<T extends Row>(rows: T[] | null): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows ?? []) {
    const list = map.get(row.brand_key);
    if (list) list.push(row);
    else map.set(row.brand_key, [row]);
  }
  return map;
}

/** Pulls the whole content tree in four queries rather than one per brand. */
export async function loadFromSupabase(): Promise<Network> {
  const db = createPublicClient();

  const [brands, services, cities, niches] = await Promise.all([
    db.from(T.brands).select("*").order("position"),
    db.from(T.services).select("*").order("position"),
    db.from(T.cities).select("*").order("position"),
    db.from(T.niches).select("*").order("position"),
  ]);

  for (const result of [brands, services, cities, niches]) {
    if (result.error) throw new Error(result.error.message);
  }

  const brandRows = (brands.data ?? []) as BrandRow[];
  if (brandRows.length === 0) throw new Error("No brands in database");

  const servicesByBrand = groupByBrand(services.data as ServiceRow[] | null);
  const citiesByBrand = groupByBrand(cities.data as CityRow[] | null);
  const nichesByBrand = groupByBrand(niches.data as NicheRow[] | null);

  return {
    network_name: brandRows[0].network_name ?? "The MHS Network",
    ga4_id: brandRows[0].ga4_id ?? "",
    brands: brandRows.map<Brand>((b) => ({
      key: b.key,
      name: b.name,
      domain: b.domain,
      phone: b.phone,
      accent: b.accent,
      central: b.central,
      tagline: b.tagline,
      pattern: b.pattern,
      services: (servicesByBrand.get(b.key) ?? []).map<Service>((s) => ({
        slug: s.slug,
        name: s.name,
        short: s.short,
        hero: s.hero,
        intro: s.intro,
        includes: toStrings(s.includes),
        why: s.why,
        from: s.from,
        faqs: toFaqs(s.faqs),
      })),
      cities: (citiesByBrand.get(b.key) ?? []).map<City>((c) => ({
        slug: c.slug,
        name: c.name,
        region: c.region,
        tier: c.tier,
        known_for: c.known_for,
        note: c.note ?? undefined,
      })),
      niches: (nichesByBrand.get(b.key) ?? []).map<Niche>((n) => ({
        slug: n.slug,
        name: n.name,
        line: n.line,
      })),
    })),
  };
}
