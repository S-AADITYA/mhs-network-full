import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GlowGrid, Reveal } from "@/components/Motion";
import { getBrand, getBrands } from "@/lib/data";
import { comboSlug, usesNiche } from "@/lib/data/combos";

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
  return {
    title: `Locations | ${brand.name}`,
    description: `Every location ${brand.name} serves, with a page for each service.`,
    alternates: { canonical: `${brand.domain}/cities/` },
  };
}

export default async function CitiesHub({
  params,
}: {
  params: Promise<{ brand: string }>;
}) {
  const { brand: key } = await params;
  const brand = await getBrand(key);
  if (!brand) notFound();
  const niche = usesNiche(brand) ? brand.niches[0] : null;
  const nicheSlug = niche ? niche.slug : null;

  return (
    <main className="wrap">
      <div className="hero">
        <div className="halo" />
        <Reveal>
          <p className="eyebrow">
            <span className="dot" />
            {brand.name}
          </p>
          <h1>
            <span className="gradient-text">Locations</span>
          </h1>
          <p className="lead">
            {brand.cities.length} locations, each with pages for all{" "}
            {brand.services.length} services.
          </p>
        </Reveal>
      </div>

      {brand.cities.map((c) => (
        <section key={c.slug}>
          <Reveal>
            <h2>{c.name}</h2>
            <p className="muted" style={{ fontSize: ".9rem", marginTop: -8 }}>
              {c.region}
            </p>
            <p className="lead">{c.note ?? c.known_for}</p>
          </Reveal>
          <Reveal delay={70}>
            <GlowGrid>
              {brand.services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${brand.key}/${comboSlug(s.slug, nicheSlug, c.slug)}/`}>
                    <span className="arrow">→</span>
                    <span className="t">{s.name}</span>
                    <span className="s">in {c.name}</span>
                  </Link>
                </li>
              ))}
            </GlowGrid>
          </Reveal>
        </section>
      ))}
    </main>
  );
}
