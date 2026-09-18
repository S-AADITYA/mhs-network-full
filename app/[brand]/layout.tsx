import Link from "next/link";
import { notFound } from "next/navigation";
import MobileNav from "@/components/MobileNav";
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

  const links = [
    { href: `/${brand.key}/`, label: "Home" },
    { href: `/${brand.key}/services/`, label: "Services" },
    { href: `/${brand.key}/cities/`, label: "Locations" },
  ];

  return (
    <div style={brandStyle(brand.accent)}>
      <Aurora />
      <a className="skip" href="#main">
        Skip to content
      </a>

      <header className="top">
        <div className="bar">
          <Link className="brandmark" href={`/${brand.key}/`}>
            <span className="chip" aria-hidden="true">
              {brand.name.charAt(0)}
            </span>
            {brand.name}
          </Link>
          <nav className="navlinks" aria-label="Primary">
            <Link href={`/${brand.key}/services/`}>Services</Link>
            <Link href={`/${brand.key}/cities/`}>Locations</Link>
          </nav>
          <a className="btn sm callcta" href={`tel:${brand.phone}`}>
            Call {brand.phone}
          </a>
          <MobileNav
            links={links}
            callHref={`tel:${brand.phone}`}
            callLabel={`Call ${brand.phone}`}
          />
        </div>
      </header>

      <div id="main">{children}</div>

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
