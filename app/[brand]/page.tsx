import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlowGrid, Reveal } from "@/components/Motion";
import { getBrand, getBrands } from "@/lib/data";
import { brandCombos, comboSlug, usesNiche } from "@/lib/data/combos";
import { brandUrl } from "@/lib/site";
import { ogImage } from "@/lib/og";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getBrands()).map((b) => ({ brand: b.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string }>;
}): Promise<Metadata> {
  const brand = await getBrand((await params).brand);
  if (!brand) return {};
  const title = `${brand.name} — ${brand.tagline}`;
  return {
    title,
    description: `${brand.tagline}. ${brand.services.length} services across ${brand.cities.length} locations.`,
    alternates: { canonical: brandUrl(brand.key) },
    openGraph: {
      title,
      url: brandUrl(brand.key),
      images: [
        ogImage({
          title: brand.name,
          eyebrow: brand.tagline,
          brand: brand.name,
          accent: brand.accent,
        }),
      ],
    },
  };
}

export default async function BrandHome({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: key } = await params;
  const brand = await getBrand(key);
  if (!brand) notFound();

  const total = brandCombos(brand).length;
  const firstCity = brand.cities[0];
  const firstNiche = usesNiche(brand) ? brand.niches[0] : null;
  const nicheSlug = firstNiche ? firstNiche.slug : null;

  return (
    <main className="wrap">
      <div className="hero">
        <div className="halo" />
        <Reveal>
          <p className="eyebrow">
            <span className="dot" />
            {brand.tagline}
          </p>
          <h1>
            <span className="gradient-text">{brand.name}</span>
          </h1>
          <p className="lead">
            {brand.services.length} services across {brand.cities.length} locations
            {usesNiche(brand) ? `, tuned to ${brand.niches.length} categories` : ""}.
            Every combination has its own page, written for that market.
          </p>
          <div className="heroactions">
            <a className="btn" href={`tel:${brand.phone}`}>
              Call {brand.phone}
            </a>
            <Link className="btn ghost" href={`/${brand.key}/services/`}>
              Browse services
            </Link>
          </div>
          <div className="metrics">
            <div className="metric">
              <b>{brand.services.length}</b>
              <span>Services</span>
            </div>
            <div className="metric">
              <b>{brand.cities.length}</b>
              <span>Locations</span>
            </div>
            <div className="metric">
              <b>{total.toLocaleString("en-IN")}</b>
              <span>Pages</span>
            </div>
          </div>
        </Reveal>
      </div>

      <section>
        <Reveal>
          <h2>What we do</h2>
        </Reveal>
        <Reveal delay={80}>
          <GlowGrid>
            {brand.services.map((s) => (
              <li key={s.slug}>
                <Link href={`/${brand.key}/${comboSlug(s.slug, nicheSlug, firstCity.slug)}/`}>
                  <span className="arrow">→</span>
                  <span className="t">{s.name}</span>
                  <span className="s">{s.hero}</span>
                </Link>
              </li>
            ))}
          </GlowGrid>
          <p style={{ marginTop: 22 }}>
            <Link href={`/${brand.key}/services/`}>All services →</Link>
          </p>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <h2>Where we work</h2>
        </Reveal>
        <Reveal delay={80}>
          <GlowGrid>
            {brand.cities.slice(0, 12).map((c) => (
              <li key={c.slug}>
                <Link href={`/${brand.key}/${comboSlug(brand.services[0].slug, nicheSlug, c.slug)}/`}>
                  <span className="arrow">→</span>
                  <span className="t">{c.name}</span>
                  <span className="s">{c.region}</span>
                </Link>
              </li>
            ))}
          </GlowGrid>
          <p style={{ marginTop: 22 }}>
            <Link href={`/${brand.key}/cities/`}>
              All {brand.cities.length} locations →
            </Link>
          </p>
        </Reveal>
      </section>
    </main>
  );
}
