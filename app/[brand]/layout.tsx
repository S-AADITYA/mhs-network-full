import Link from "next/link";
import { notFound } from "next/navigation";
import { Aurora } from "@/components/Motion";
import { brandStyle } from "@/lib/color";
import { getBrand, getSiblingBrands } from "@/lib/data";

export default async function BrandLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brand: string }>;
}) {
  const { brand: key } = await params;
  const brand = await getBrand(key);
  if (!brand) notFound();
  const siblings = await getSiblingBrands(key);

  return (
    <div style={brandStyle(brand.accent)}>
      <Aurora />

      <header className="top">
        <div className="bar">
          <Link className="brandmark" href={`/${brand.key}/`}>
            <span className="chip">{brand.name.charAt(0)}</span>
            {brand.name}
          </Link>
          <nav className="navlinks">
            <Link href={`/${brand.key}/services/`}>Services</Link>
            <Link href={`/${brand.key}/cities/`}>Locations</Link>
          </nav>
          <a className="btn sm" href={`tel:${brand.phone}`}>
            Call {brand.phone}
          </a>
        </div>
      </header>

      {children}

      <footer>
        <div className="wrap">
          <strong style={{ color: "var(--ink)" }}>{brand.name}</strong> — {brand.tagline}.
          <br />
          Call <a href={`tel:${brand.phone}`}>{brand.phone}</a>
          <div className="net">
            <span style={{ color: "var(--ink3)" }}>Part of The MHS Network:</span>
            {siblings.map((s) => (
              <a key={s.key} href={s.domain} rel="noopener">
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
