import { SITE_URL } from "@/lib/site";

/** Builds the share-card URL for a page. Kept in one place so every page's
 *  card is composed the same way. */
export function ogImage(opts: {
  title: string;
  eyebrow?: string;
  brand?: string;
  accent?: string;
}): string {
  const params = new URLSearchParams({ title: opts.title });
  if (opts.eyebrow) params.set("eyebrow", opts.eyebrow);
  if (opts.brand) params.set("brand", opts.brand);
  if (opts.accent) params.set("accent", opts.accent.replace("#", ""));
  // Trailing slash matters: the app redirects /api/og -> /api/og/, and
  // several social crawlers do not follow the redirect.
  return `${SITE_URL}/api/og/?${params.toString()}`;
}
