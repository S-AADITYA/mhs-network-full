import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import { GlowGrid, Reveal } from "@/components/Motion";
import { getBrand, getBrands } from "@/lib/data";
import { brandCombos, comboSlug, findCombo, usesNiche } from "@/lib/data/combos";
import { cityContext } from "@/lib/data/city-context";

export const revalidate = 3600;
export const dynamicParams = true;

/** Pre-render every combination; rows added later render on first request. */
export async function generateStaticParams() {
  const brands = await getBrands();
  return brands.flatMap((b) =>
    brandCombos(b).map((c) => ({ brand: b.key, slug: c.slug })),
  );
}

async function resolve(brandKey: string, slug: string) {
  const brand = await getBrand(brandKey);
  if (!brand) return null;
  return findCombo(brand, slug);
}

function describe(
  service: { short: string; intro: string },
  city: { name: string; region: string },
  nicheLine: string,
) {
  const head = service.short.charAt(0).toUpperCase() + service.short.slice(1);
  return `${head}${nicheLine} in ${city.name}, ${city.region}. ${service.intro.slice(0, 100)}`.trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}): Promise<Metadata> {
  const { brand: brandKey, slug } = await params;
  const combo = await resolve(brandKey, slug);
  if (!combo) return {};
  const { brand, service, city, niche } = combo;

  const title = `${service.name}${niche ? ` for ${niche.name}` : ""} in ${city.name} | ${brand.name}`;
  const description = describe(service, city, niche ? ` ${niche.line}` : "");
  const url = `${brand.domain}/${slug}/`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}

export default async function ComboPage({
  params,
}: {
  params: Promise<{ brand: string; slug: string }>;
}) {
  const { brand: brandKey, slug } = await params;
  const combo = await resolve(brandKey, slug);
  if (!combo) notFound();

  const { brand, service, city, niche } = combo;
  const nichePart = niche ? ` for ${niche.name}` : "";
  const url = `${brand.domain}/${slug}/`;
  const description = describe(service, city, niche ? ` ${niche.line}` : "");

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${service.name}${nichePart} in ${city.name}`,
    areaServed: city.name,
    provider: { "@type": "LocalBusiness", name: brand.name, telephone: brand.phone },
    description,
  };
  const faqLd = service.faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: service.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  const nicheSlug = usesNiche(brand) && niche ? niche.slug : null;
  const otherCities = brand.cities.filter((c) => c.slug !== city.slug).slice(0, 6);
  const otherServices = brand.services.filter((s) => s.slug !== service.slug).slice(0, 6);

  return (
    <main className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}

      <div className="hero">
        <div className="halo" />
        <Reveal>
          <p className="eyebrow">
            <span className="dot" />
            {city.name} · {city.region}
          </p>
          <h1>
            {service.name}
            {nichePart} in <span className="gradient-text">{city.name}</span>
          </h1>
          <p className="lead">
            {service.hero}. {service.intro}
          </p>
          <div className="heroactions">
            <Link className="btn" href="#book">
              Request a callback
            </Link>
            <a className="btn ghost" href={`tel:${brand.phone}`}>
              Call {brand.phone}
            </a>
          </div>
          {service.from === "quote" ? null : (
            <div className="metrics">
              <div className="metric">
                <b>₹{service.from}</b>
                <span>Starting from</span>
              </div>
            </div>
          )}
        </Reveal>
      </div>

      <section>
        <Reveal>
          <h2>What&rsquo;s included</h2>
          <ul className="check">
            {service.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <h2>Why it matters</h2>
          <p className="lead">{service.why}</p>
          <div className="card glow" style={{ marginTop: 20 }}>
            {cityContext(service, city)}
          </div>
        </Reveal>
      </section>

      {service.faqs.length ? (
        <section className="faq">
          <Reveal>
            <h2>Questions people ask</h2>
            {service.faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </section>
      ) : null}

      <section id="book">
        <Reveal>
          <h2>
            Get {service.name.toLowerCase()} in {city.name}
          </h2>
          <p className="lead" style={{ marginBottom: 26 }}>
            Tell us what you need — we reply within the hour during working hours.
          </p>
          <LeadForm
            brand={brand.name}
            service={service.name}
            city={city.name}
            sourceUrl={url}
          />
        </Reveal>
      </section>

      <section>
        <Reveal>
          <h2>{service.name} elsewhere</h2>
        </Reveal>
        <Reveal delay={70}>
          <GlowGrid>
            {otherCities.map((c) => (
              <li key={c.slug}>
                <Link href={`/${brand.key}/${comboSlug(service.slug, nicheSlug, c.slug)}/`}>
                  <span className="arrow">→</span>
                  <span className="t">
                    {service.name} in {c.name}
                  </span>
                  <span className="s">{c.region}</span>
                </Link>
              </li>
            ))}
          </GlowGrid>
        </Reveal>
      </section>

      <section>
        <Reveal>
          <h2>Other services in {city.name}</h2>
        </Reveal>
        <Reveal delay={70}>
          <GlowGrid>
            {otherServices.map((s) => (
              <li key={s.slug}>
                <Link href={`/${brand.key}/${comboSlug(s.slug, nicheSlug, city.slug)}/`}>
                  <span className="arrow">→</span>
                  <span className="t">{s.name}</span>
                  <span className="s">in {city.name}</span>
                </Link>
              </li>
            ))}
          </GlowGrid>
        </Reveal>
      </section>
    </main>
  );
}
