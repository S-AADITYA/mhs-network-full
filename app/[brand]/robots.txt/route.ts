import { getBrand, getBrands } from "@/lib/data";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getBrands()).map((b) => ({ brand: b.key }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ brand: string }> },
) {
  const { brand: key } = await params;
  const brand = await getBrand(key);
  if (!brand) return new Response("Not found", { status: 404 });

  const body = `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${brand.domain}/sitemap.xml\n`;
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
