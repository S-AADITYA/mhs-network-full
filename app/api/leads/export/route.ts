import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { hasServiceSupabase } from "@/lib/supabase/env";
import type { Lead } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = [
  "id",
  "created_at",
  "brand",
  "service",
  "city",
  "name",
  "phone",
  "message",
  "status",
  "source_url",
] as const;

/** Escapes a value for CSV, and defuses spreadsheet formula injection. */
function cell(value: unknown): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!hasServiceSupabase()) {
    return new Response("Not configured", { status: 503 });
  }

  // The export bypasses RLS, so it must be gated on a signed-in admin.
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const db = createAdminClient();
  const { data, error } = await db
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) return new Response(`Export failed: ${error.message}`, { status: 502 });

  const rows = (data ?? []) as Lead[];
  const csv = [
    COLUMNS.join(","),
    ...rows.map((r) => COLUMNS.map((c) => cell(r[c as keyof Lead])).join(",")),
  ].join("\r\n");

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${csv}`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leads-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
