import type { Brand, PageCombo } from "@/lib/types";

/**
 * Slug shape, kept identical to the original generate.py:
 *   service[-niche]-city
 * Changing this breaks every indexed URL, so it lives in one place.
 */
export function comboSlug(
  serviceSlug: string,
  nicheSlug: string | null,
  citySlug: string,
): string {
  return [serviceSlug, ...(nicheSlug ? [nicheSlug] : []), citySlug].join("-");
}

export function usesNiche(brand: Brand): boolean {
  return brand.pattern === "service_niche_city" && brand.niches.length > 0;
}

/** Every page a brand produces. Mirrors the build() loop in generate.py. */
export function brandCombos(brand: Brand): PageCombo[] {
  const niches: (typeof brand.niches[number] | null)[] = usesNiche(brand)
    ? brand.niches
    : [null];
  const out: PageCombo[] = [];
  for (const service of brand.services) {
    for (const niche of niches) {
      for (const city of brand.cities) {
        out.push({
          brand,
          service,
          city,
          niche,
          slug: comboSlug(service.slug, niche ? niche.slug : null, city.slug),
        });
      }
    }
  }
  return out;
}

/** Resolve a URL slug back to its combo without scanning every combination. */
export function findCombo(brand: Brand, slug: string): PageCombo | null {
  const niches = usesNiche(brand) ? brand.niches : [null];
  for (const service of brand.services) {
    if (!slug.startsWith(service.slug + "-")) continue;
    for (const niche of niches) {
      for (const city of brand.cities) {
        const candidate = comboSlug(
          service.slug,
          niche ? niche.slug : null,
          city.slug,
        );
        if (candidate === slug) {
          return { brand, service, city, niche, slug };
        }
      }
    }
  }
  return null;
}
