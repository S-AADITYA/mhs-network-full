/**
 * Where these pages actually live.
 *
 * Canonical URLs must point at a URL that serves the page. The brands' own
 * domains run separate websites and 404 on these paths, so pointing canonicals
 * there would tell Google the real version is a missing page and the whole
 * network would drop out of the index.
 *
 * Set NEXT_PUBLIC_SITE_URL when the pages move to a domain you own.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mhs-network-full.vercel.app"
).replace(/\/+$/, "");

export function brandUrl(brandKey: string): string {
  return `${SITE_URL}/${brandKey}/`;
}

export function pageUrl(brandKey: string, slug: string): string {
  return `${SITE_URL}/${brandKey}/${slug}/`;
}

export function sectionUrl(brandKey: string, section: string): string {
  return `${SITE_URL}/${brandKey}/${section}/`;
}
