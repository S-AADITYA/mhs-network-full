import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasServiceSupabase } from "@/lib/supabase/env";

export const runtime = "nodejs";

const REQUIRED = ["brand", "service", "city", "name", "phone"] as const;
const MAX = 2000;

function clean(value: unknown): string {
  return String(value ?? "").trim().slice(0, MAX);
}

export async function POST(request: Request) {
  if (!hasServiceSupabase()) {
    return NextResponse.json(
      { error: "Lead capture is not configured yet." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
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
  if (phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json(
      { error: "That phone number looks incomplete." },
      { status: 400 },
    );
  }

  try {
    const db = createAdminClient();
    const { error } = await db.from("leads").insert({
      brand: clean(body.brand),
      service: clean(body.service),
      city: clean(body.city),
      source_url: clean(body.source_url) || null,
      name: clean(body.name),
      phone,
      message: clean(body.message) || null,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("Lead insert failed:", err);
    return NextResponse.json(
      { error: "Could not save that. Please call us instead." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
