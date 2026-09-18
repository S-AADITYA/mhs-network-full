import Link from "next/link";
import { getNetwork, supabaseDataConfigured } from "@/lib/data";
import { brandCombos } from "@/lib/data/combos";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceSupabase } from "@/lib/supabase/env";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

async function leadStats() {
  if (!hasServiceSupabase()) return null;
  const db = createAdminClient();
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const [total, recent, fresh, latest] = await Promise.all([
    db.from("leads").select("*", { count: "exact", head: true }),
    db.from("leads").select("*", { count: "exact", head: true }).gte("created_at", since),
    db.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    db.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
  ]);
  return {
    total: total.count ?? 0,
    recent: recent.count ?? 0,
    fresh: fresh.count ?? 0,
    latest: (latest.data ?? []) as Lead[],
  };
}

export default async function AdminHome() {
  const net = await getNetwork();
  const pages = net.brands.reduce((n, b) => n + brandCombos(b).length, 0);
  const stats = await leadStats().catch(() => null);

  return (
    <>
      <div className="spread">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Overview</h1>
        <span className="who">
          Content source: {supabaseDataConfigured() ? "Supabase" : "config.json (fallback)"}
        </span>
      </div>

      <ul className="stats">
        <li className="stat">
          <b>{pages.toLocaleString("en-IN")}</b>
          <span>Live pages</span>
        </li>
        <li className="stat">
          <b>{net.brands.length}</b>
          <span>Brands</span>
        </li>
        <li className="stat">
          <b>{stats ? stats.total.toLocaleString("en-IN") : "—"}</b>
          <span>Total leads</span>
        </li>
        <li className="stat">
          <b>{stats ? stats.recent.toLocaleString("en-IN") : "—"}</b>
          <span>Leads, last 7 days</span>
        </li>
        <li className="stat">
          <b>{stats ? stats.fresh.toLocaleString("en-IN") : "—"}</b>
          <span>Awaiting contact</span>
        </li>
      </ul>

      {!stats ? (
        <div className="empty">
          Supabase is not connected, so lead figures are unavailable. The public
          site is running from <code>data/config.json</code>.
        </div>
      ) : (
        <>
          <div className="spread">
            <h2 style={{ margin: 0 }}>Latest leads</h2>
            <Link className="btn ghost" href="/admin/leads/">
              All leads
            </Link>
          </div>
          {stats.latest.length === 0 ? (
            <div className="empty">No leads yet.</div>
          ) : (
            <table className="grid2">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Service</th>
                  <th>City</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.latest.map((l) => (
                  <tr key={l.id}>
                    <td>{new Date(l.created_at).toLocaleString("en-IN")}</td>
                    <td>{l.name}</td>
                    <td>{l.phone}</td>
                    <td>{l.service}</td>
                    <td>{l.city}</td>
                    <td>
                      <span className={`badge ${l.status}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <section style={{ borderTop: "1px solid var(--line)", marginTop: 28 }}>
        <h2>Brands</h2>
        <table className="grid2">
          <thead>
            <tr>
              <th>Brand</th>
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
                  <div className="muted">{b.domain}</div>
                </td>
                <td>{b.services.length}</td>
                <td>{b.cities.length}</td>
                <td>{b.niches.length || "—"}</td>
                <td>{brandCombos(b).length.toLocaleString("en-IN")}</td>
                <td>
                  <Link className="btn ghost" href={`/admin/content/${b.key}/`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
