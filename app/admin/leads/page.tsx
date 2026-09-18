import Link from "next/link";
import { deleteLead, updateLeadStatus } from "../actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceSupabase } from "@/lib/supabase/env";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
const PAGE_SIZE = 50;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number])
    ? sp.status!
    : "";
  const q = (sp.q ?? "").trim();
  const page = Math.max(1, Number(sp.page ?? 1) || 1);

  if (!hasServiceSupabase()) {
    return (
      <>
        <h1 style={{ fontSize: "1.5rem" }}>Leads</h1>
        <div className="empty">
          Supabase is not connected, so there is nowhere to read leads from yet.
        </div>
      </>
    );
  }

  const db = createAdminClient();
  let query = db
    .from("leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (status) query = query.eq("status", status);
  if (q) query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,city.ilike.%${q}%`);

  const { data, count, error } = await query;
  const leads = (data ?? []) as Lead[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function href(next: Record<string, string | number>) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);
    for (const [k, v] of Object.entries(next)) {
      if (v === "") params.delete(k);
      else params.set(k, String(v));
    }
    const s = params.toString();
    return `/admin/leads/${s ? `?${s}` : ""}`;
  }

  return (
    <>
      <div className="spread">
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
          Leads <span className="muted" style={{ fontWeight: 400 }}>({total})</span>
        </h1>
        <a className="btn ghost sm" href="/api/leads/export/">
          Export CSV
        </a>
      </div>

      <form className="row" style={{ marginBottom: 18 }} action="/admin/leads/">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name, phone or city"
          style={{ maxWidth: 280 }}
        />
        <select name="status" defaultValue={status} style={{ maxWidth: 170 }}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn sm" type="submit">
          Filter
        </button>
        {status || q ? (
          <Link className="btn ghost sm" href="/admin/leads/">
            Clear
          </Link>
        ) : null}
      </form>

      {error ? (
        <div className="empty err">Could not load leads: {error.message}</div>
      ) : leads.length === 0 ? (
        <div className="empty">No leads match that.</div>
      ) : (
        <table className="grid2">
          <thead>
            <tr>
              <th>When</th>
              <th>Contact</th>
              <th>Wanted</th>
              <th>Message</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td style={{ whiteSpace: "nowrap" }}>
                  {new Date(l.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                  <div className="muted" style={{ fontSize: ".8rem" }}>
                    {new Date(l.created_at).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </td>
                <td>
                  <b>{l.name}</b>
                  <div>
                    <a href={`tel:${l.phone}`}>{l.phone}</a>
                  </div>
                </td>
                <td>
                  {l.service}
                  <div className="muted" style={{ fontSize: ".82rem" }}>
                    {l.city} · {l.brand}
                  </div>
                </td>
                <td style={{ maxWidth: 260 }}>
                  <span className="muted">{l.message || "—"}</span>
                  {l.source_url ? (
                    <div style={{ fontSize: ".78rem", marginTop: 4 }}>
                      <a href={l.source_url} target="_blank" rel="noopener noreferrer">
                        source page
                      </a>
                    </div>
                  ) : null}
                </td>
                <td>
                  <form className="inline" action={updateLeadStatus}>
                    <input type="hidden" name="id" value={l.id} />
                    <select name="status" defaultValue={l.status}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button className="btn ghost sm" type="submit">
                      Set
                    </button>
                  </form>
                </td>
                <td>
                  <form action={deleteLead}>
                    <input type="hidden" name="id" value={l.id} />
                    <button className="btn danger sm" type="submit">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pages > 1 ? (
        <div className="row" style={{ marginTop: 18, justifyContent: "center" }}>
          {page > 1 ? (
            <Link className="btn ghost sm" href={href({ page: page - 1 })}>
              ← Previous
            </Link>
          ) : null}
          <span className="muted" style={{ fontSize: ".88rem" }}>
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link className="btn ghost sm" href={href({ page: page + 1 })}>
              Next →
            </Link>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
