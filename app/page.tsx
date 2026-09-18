import Link from "next/link";
import { Aurora, GlowGrid, Reveal } from "@/components/Motion";
import { brandStyle } from "@/lib/color";
import { getNetwork } from "@/lib/data";
import { brandCombos } from "@/lib/data/combos";

export const revalidate = 3600;

export default async function NetworkHome() {
  const net = await getNetwork();
  const brands = net.brands.map((b) => ({ brand: b, count: brandCombos(b).length }));
  const pages = brands.reduce((n, b) => n + b.count, 0);
  const cities = new Set(net.brands.flatMap((b) => b.cities.map((c) => c.slug))).size;
  const services = net.brands.reduce((n, b) => n + b.services.length, 0);

  return (
    <>
      <Aurora />

      <header className="top">
        <div className="bar">
          <span className="brandmark">
            <span className="chip">M</span>
            {net.network_name}
          </span>
          <nav className="navlinks">
            {net.brands.map((b) => (
              <Link key={b.key} href={`/${b.key}/`}>
                {b.name}
              </Link>
            ))}
          </nav>
          <Link className="btn ghost sm" href="/admin/">
            Admin
          </Link>
        </div>
      </header>

      <main className="wrap">
        <div className="hero">
          <div className="halo" />
          <Reveal>
            <p className="eyebrow">
              <span className="dot" />
              {brands.length} brands · one network
            </p>
            <h1>
              Specialist teams,{" "}
              <span className="gradient-text">built for every market</span>
            </h1>
            <p className="lead">
              Influencer marketing, ad production, founder media and event
              catering — each brand with its own services, cities and dedicated
              pages.
            </p>
            <div className="metrics">
              <div className="metric">
                <b>{pages.toLocaleString("en-IN")}</b>
                <span>Pages live</span>
              </div>
              <div className="metric">
                <b>{services}</b>
                <span>Services</span>
              </div>
              <div className="metric">
                <b>{cities}</b>
                <span>Locations</span>
              </div>
            </div>
          </Reveal>
        </div>

        <section>
          <Reveal>
            <h2>The brands</h2>
            <p className="lead" style={{ marginBottom: 30 }}>
              Each runs independently, on its own domain, with its own team.
            </p>
          </Reveal>
          <Reveal delay={90}>
            <GlowGrid>
              {brands.map(({ brand, count }) => (
                <li key={brand.key} style={brandStyle(brand.accent)}>
                  <Link href={`/${brand.key}/`}>
                    <span className="arrow">→</span>
                    <span className="t">{brand.name}</span>
                    <span className="s">{brand.tagline}</span>
                    <span className="s" style={{ marginTop: 6, opacity: 0.8 }}>
                      {brand.services.length} services · {brand.cities.length} locations ·{" "}
                      {count.toLocaleString("en-IN")} pages
                    </span>
                  </Link>
                </li>
              ))}
            </GlowGrid>
          </Reveal>
        </section>
      </main>

      <footer>
        <div className="wrap">
          {net.network_name}. Each brand also runs on its own domain.
          <div className="net">
            {net.brands.map((b) => (
              <a key={b.key} href={b.domain} rel="noopener">
                {b.name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
