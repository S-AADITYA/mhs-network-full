#!/usr/bin/env node
/**
 * Loads data/config.json into Supabase.
 *
 * Idempotent: rows are upserted on (brand_key, slug), so running it twice is
 * safe and re-running after editing config.json pushes the changes up.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running the seed.",
  );
  process.exit(1);
}

const cfg = JSON.parse(readFileSync(join(root, "data", "config.json"), "utf8"));
const db = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  const brands = cfg.brands ?? [];
  console.log(`Seeding ${brands.length} brands from data/config.json\n`);

  const brandRows = brands.map((b, i) => ({
    key: b.key,
    name: b.name,
    domain: b.domain,
    phone: b.phone,
    accent: b.accent,
    central: Boolean(b.central),
    tagline: b.tagline ?? "",
    pattern: b.pattern ?? "service_city",
    network_name: cfg.network_name ?? "The MHS Network",
    ga4_id: cfg.ga4_id ?? "",
    position: i,
  }));

  const { error: brandError } = await db
    .from("brands")
    .upsert(brandRows, { onConflict: "key" });
  if (brandError) throw new Error(`brands: ${brandError.message}`);
  console.log(`  brands      ${brandRows.length}`);

  const services = [];
  const cities = [];
  const niches = [];

  for (const b of brands) {
    (b.services ?? []).forEach((s, i) =>
      services.push({
        brand_key: b.key,
        slug: s.slug,
        name: s.name,
        short: s.short ?? "",
        hero: s.hero ?? "",
        intro: s.intro ?? "",
        includes: s.includes ?? [],
        why: s.why ?? "",
        from: s.from ?? "quote",
        faqs: s.faqs ?? [],
        position: i,
      }),
    );
    (b.cities ?? []).forEach((c, i) =>
      cities.push({
        brand_key: b.key,
        slug: c.slug,
        name: c.name,
        region: c.region ?? "",
        tier: c.tier ?? "",
        known_for: c.known_for ?? "",
        note: c.note ?? null,
        position: i,
      }),
    );
    (b.niches ?? []).forEach((n, i) =>
      niches.push({
        brand_key: b.key,
        slug: n.slug,
        name: n.name,
        line: n.line ?? "",
        position: i,
      }),
    );
  }

  for (const [table, rows] of [
    ["services", services],
    ["cities", cities],
    ["niches", niches],
  ]) {
    if (rows.length === 0) continue;
    // Chunked so a large network stays under the request size limit.
    for (let i = 0; i < rows.length; i += 500) {
      const slice = rows.slice(i, i + 500);
      const { error } = await db
        .from(table)
        .upsert(slice, { onConflict: "brand_key,slug" });
      if (error) throw new Error(`${table}: ${error.message}`);
    }
    console.log(`  ${table.padEnd(11)} ${rows.length}`);
  }

  const pages = brands.reduce((total, b) => {
    const useNiche = b.pattern === "service_niche_city" && (b.niches ?? []).length;
    const nicheCount = useNiche ? b.niches.length : 1;
    return total + (b.services ?? []).length * nicheCount * (b.cities ?? []).length;
  }, 0);

  console.log(`\nDone. ${pages.toLocaleString("en-IN")} pages will generate.`);
}

run().catch((err) => {
  console.error(`\nSeed failed: ${err.message}`);
  process.exit(1);
});
