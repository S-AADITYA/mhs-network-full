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
    title: `Services | ${brand.name}`,
    description: `Every service ${brand.name} offers, with a dedicated page for each location.`,
    alternates: { canonical: `${brand.domain}/services/` },
  };
}

export default async function ServicesHub({
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
            <span className="gradient-text">Services</span>
          </h1>
          <p className="lead">
            {brand.services.length} services, each available across{" "}
            {brand.cities.length} locations.
          </p>
        </Reveal>
      </div>

      {brand.services.map((s) => (
        <section key={s.slug}>
          <Reveal>
            <h2>{s.name}</h2>
            <p className="lead">{s.intro}</p>
            <p className="muted" style={{ fontSize: ".9rem" }}>
              {s.from === "quote" ? (
                "Priced on brief"
              ) : (
                <>
                  From <strong style={{ color: "var(--ink)" }}>₹{s.from}</strong>
                </>
              )}
            </p>
          </Reveal>
          <Reveal delay={70}>
            <GlowGrid>
              {brand.cities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${brand.key}/${comboSlug(s.slug, nicheSlug, c.slug)}/`}>
                    <span className="arrow">→</span>
                    <span className="t">
                      {s.name} in {c.name}
                    </span>
                    <span className="s">{c.region}</span>
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
