import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export const runtime = "nodejs";

const REQUIRED = ["brand", "service", "city", "name", "phone"] as const;
const MAX = 2000;

/** Minimum time a genuine visitor takes to fill the form. Bots post instantly. */
const MIN_FILL_MS = 2500;

/** Per-IP rate limit. In-memory, so it is per instance — it blunts a flood
 *  rather than replacing a real WAF, which is the right trade for a form a
 *  human submits once. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

function clean(value: unknown): string {
  return String(value ?? "").trim().slice(0, MAX);
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : "").trim() || "unknown";
}

export async function POST(request: Request) {
  if (!hasSupabase()) {
    return NextResponse.json(
      { error: "Lead capture is not configured yet." },
      { status: 503 },
    );
  }

  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: a field hidden from people, so anything in it is a bot. Answer
  // 201 so the bot believes it succeeded and does not retry with a variation.
  if (clean(body.company)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const elapsed = Number(body.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_FILL_MS) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  for (const field of REQUIRED) {
    if (!clean(body[field])) {
      return NextResponse.json(
        { error: "Please fill in your name and phone number." },
        { status: 400 },
      );
    }
  }

  const phone = clean(body.phone);
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return NextResponse.json(
      { error: "That phone number does not look right." },
      { status: 400 },
    );
  }

  const name = clean(body.name);
  const message = clean(body.message);

  // Links in a lead form are almost always spam; a real enquiry rarely has one.
  if (/https?:\/\/|\[url=|<a\s/i.test(`${name} ${message}`)) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  try {
    // Goes through the SECURITY DEFINER function: the anon role has no rights
    // on the leads table itself, so a lead can be created but never read back.
    const db = createPublicClient();
    const { error } = await db.rpc("mhs_submit_lead", {
      p_brand: clean(body.brand),
      p_service: clean(body.service),
      p_city: clean(body.city),
      p_name: name,
      p_phone: phone,
      p_message: message || null,
      p_source_url: clean(body.source_url) || null,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("Lead submit failed:", err);
    return NextResponse.json(
      { error: "Could not save that. Please call us instead." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
