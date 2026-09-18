import type { MetadataRoute } from "next";
import { getBrands } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const brands = await getBrands();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: brands.map((b) => `${SITE_URL}/${b.key}/sitemap.xml`),
    host: SITE_URL,
  };
}
