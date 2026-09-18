import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteRow } from "../../actions";
import { CityForm, NicheForm, ServiceForm } from "./EditorForms";
import { getBrand, supabaseDataConfigured } from "@/lib/data";
import { brandCombos, usesNiche } from "@/lib/data/combos";

export const dynamic = "force-dynamic";

export default async function BrandContent({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const brand = await getBrand(key);
  if (!brand) notFound();

  const editable = supabaseDataConfigured();
  const pages = brandCombos(brand).length;

  return (
    <>
      <div className="spread">
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{brand.name}</h1>
          <span className="muted" style={{ fontSize: ".88rem" }}>
            {pages.toLocaleString("en-IN")} pages ·{" "}
            {brand.pattern === "service_niche_city"
              ? "service × category × city"
              : "service × city"}
          </span>
        </div>
        <div className="row">
          <Link className="btn ghost sm" href="/admin/content/">
            ← All brands
          </Link>
          <Link className="btn ghost sm" href={`/${brand.key}/`}>
            View site
          </Link>
        </div>
      </div>

      {!editable ? (
        <div className="empty" style={{ marginBottom: 22 }}>
          Read-only: content is coming from <code>data/config.json</code>.
          Connect Supabase and seed it to edit here.
        </div>
      ) : null}

      <section style={{ padding: "0 0 32px" }}>
        <h2 style={{ fontSize: "1.15rem" }}>
          Services <span className="muted">({brand.services.length})</span>
        </h2>
        {brand.services.map((s, i) => (
          <details className="editor" key={s.slug}>
            <summary>
              {s.name}
              <span className="muted" style={{ fontWeight: 400, fontSize: ".84rem" }}>
                {" "}
                /{s.slug}
              </span>
            </summary>
            <div style={{ marginTop: 14 }}>
              {editable ? (
                <>
                  <ServiceForm brandKey={brand.key} service={s} position={i} />
                  <form action={deleteRow} style={{ marginTop: 14 }}>
                    <input type="hidden" name="table" value="services" />
                    <input type="hidden" name="brand_key" value={brand.key} />
                    <input type="hidden" name="slug" value={s.slug} />
                    <button className="btn danger sm" type="submit">
                      Delete service
                    </button>
                  </form>
                </>
              ) : (
                <p className="muted">{s.intro}</p>
              )}
            </div>
          </details>
        ))}
        {editable ? (
          <details className="editor">
            <summary>+ Add a service</summary>
            <div style={{ marginTop: 14 }}>
              <ServiceForm brandKey={brand.key} position={brand.services.length} />
            </div>
          </details>
        ) : null}
      </section>

      <section style={{ padding: "0 0 32px", borderTop: "1px solid var(--line)" }}>
        <h2 style={{ fontSize: "1.15rem", marginTop: 26 }}>
          Locations <span className="muted">({brand.cities.length})</span>
        </h2>
        {brand.cities.map((c, i) => (
          <details className="editor" key={c.slug}>
            <summary>
              {c.name}
              <span className="muted" style={{ fontWeight: 400, fontSize: ".84rem" }}>
                {" "}
                · {c.region}
                {c.note ? " · custom note" : ""}
              </span>
            </summary>
            <div style={{ marginTop: 14 }}>
              {editable ? (
                <>
                  <CityForm brandKey={brand.key} city={c} position={i} />
                  <form action={deleteRow} style={{ marginTop: 14 }}>
                    <input type="hidden" name="table" value="cities" />
                    <input type="hidden" name="brand_key" value={brand.key} />
                    <input type="hidden" name="slug" value={c.slug} />
                    <button className="btn danger sm" type="submit">
                      Delete location
                    </button>
                  </form>
                </>
              ) : (
                <p className="muted">{c.note ?? c.known_for}</p>
              )}
            </div>
          </details>
        ))}
        {editable ? (
          <details className="editor">
            <summary>+ Add a location</summary>
            <div style={{ marginTop: 14 }}>
              <CityForm brandKey={brand.key} position={brand.cities.length} />
            </div>
          </details>
        ) : null}
      </section>

      {usesNiche(brand) || brand.niches.length > 0 ? (
        <section style={{ padding: "0 0 40px", borderTop: "1px solid var(--line)" }}>
          <h2 style={{ fontSize: "1.15rem", marginTop: 26 }}>
            Categories <span className="muted">({brand.niches.length})</span>
          </h2>
          {brand.niches.map((n, i) => (
            <details className="editor" key={n.slug}>
              <summary>{n.name}</summary>
              <div style={{ marginTop: 14 }}>
                {editable ? (
                  <>
                    <NicheForm brandKey={brand.key} niche={n} position={i} />
                    <form action={deleteRow} style={{ marginTop: 14 }}>
                      <input type="hidden" name="table" value="niches" />
                      <input type="hidden" name="brand_key" value={brand.key} />
                      <input type="hidden" name="slug" value={n.slug} />
                      <button className="btn danger sm" type="submit">
                        Delete category
                      </button>
                    </form>
                  </>
                ) : (
                  <p className="muted">{n.line}</p>
                )}
              </div>
            </details>
          ))}
          {editable ? (
            <details className="editor">
              <summary>+ Add a category</summary>
              <div style={{ marginTop: 14 }}>
                <NicheForm brandKey={brand.key} position={brand.niches.length} />
              </div>
            </details>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
