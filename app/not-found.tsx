import Link from "next/link";
import { Aurora } from "@/components/Motion";
import { getBrands } from "@/lib/data";

export default async function NotFound() {
  const brands = await getBrands();
  return (
    <>
      <Aurora />
      <main className="wrap">
        <div className="hero">
          <div className="halo" />
          <p className="eyebrow">
            <span className="dot" />
            404
          </p>
          <h1>
            That page <span className="gradient-text">does not exist</span>
          </h1>
          <p className="lead">
            The link may be out of date, or the service and location combination
            may have changed. Start from a brand below.
          </p>
          <div className="heroactions">
            <Link className="btn" href="/">
              Network home
            </Link>
          </div>
        </div>
        <section>
          <h2>Brands</h2>
          <ul className="grid">
            {brands.map((b) => (
              <li key={b.key}>
                <Link href={`/${b.key}/`}>
                  <span className="arrow">→</span>
                  <span className="t">{b.name}</span>
                  <span className="s">{b.tagline}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
