import { getBrand, getBrands } from "@/lib/data";
import { brandCombos } from "@/lib/data/combos";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getBrands()).map((b) => ({ brand: b.key }));
}

/** Per-brand sitemap using the brand's own domain, as the old generator did. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ brand: string }> },
) {
  const { brand: key } = await params;
  const brand = await getBrand(key);
  if (!brand) return new Response("Not found", { status: 404 });

  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    `${brand.domain}/`,
    `${brand.domain}/services/`,
    `${brand.domain}/cities/`,
    ...brandCombos(brand).map((c) => `${brand.domain}/${c.slug}/`),
  ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
}
