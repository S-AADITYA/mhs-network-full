import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export interface Crumb {
  href?: string;
  label: string;
}

/**
 * Visible breadcrumbs plus BreadcrumbList structured data.
 *
 * On a network this wide these do real work: they give every deep page a route
 * back to its hubs, and they are what Google shows instead of a bare URL in the
 * result snippet.
 */
export default function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="crumbs">
          {crumbs.map((c, i) => (
            <li key={c.label}>
              {c.href && i < crumbs.length - 1 ? (
                <Link href={c.href}>{c.label}</Link>
              ) : (
                <span aria-current="page">{c.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
