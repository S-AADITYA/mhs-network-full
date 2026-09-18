import Link from "next/link";
import { getNetwork, supabaseDataConfigured } from "@/lib/data";
import { brandCombos } from "@/lib/data/combos";

export const dynamic = "force-dynamic";

export default async function ContentIndex() {
  const net = await getNetwork();

  return (
    <>
      <div className="spread">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Content</h1>
        <span className="who">
          Source: {supabaseDataConfigured() ? "Supabase" : "config.json (read-only)"}
        </span>
      </div>

      {!supabaseDataConfigured() ? (
        <div className="empty" style={{ marginBottom: 20 }}>
          Content is being served from <code>data/config.json</code>. Connect
          Supabase and run the seed to edit it here.
        </div>
      ) : null}

      <table className="grid2">
        <thead>
          <tr>
            <th>Brand</th>
            <th>Pattern</th>
            <th>Services</th>
            <th>Locations</th>
            <th>Categories</th>
            <th>Pages</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {net.brands.map((b) => (
            <tr key={b.key}>
              <td>
                <b>{b.name}</b>
                <div className="muted" style={{ fontSize: ".82rem" }}>{b.domain}</div>
              </td>
              <td className="muted" style={{ fontSize: ".82rem" }}>
                {b.pattern === "service_niche_city"
                  ? "service × category × city"
                  : "service × city"}
              </td>
              <td>{b.services.length}</td>
              <td>{b.cities.length}</td>
              <td>{b.niches.length || "—"}</td>
              <td>{brandCombos(b).length.toLocaleString("en-IN")}</td>
              <td>
                <Link className="btn ghost sm" href={`/admin/content/${b.key}/`}>
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
