"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/**
 * Every write below runs with the service key, which bypasses RLS, so each one
 * must first prove there is a signed-in admin behind the request.
 */
async function requireUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  return user;
}

const STATUSES = ["new", "contacted", "qualified", "won", "lost"];

export async function updateLeadStatus(formData: FormData): Promise<void> {
  await requireUser();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!Number.isFinite(id) || !STATUSES.includes(status)) return;

  const db = createAdminClient();
  await db.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLead(formData: FormData): Promise<void> {
  await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  const db = createAdminClient();
  await db.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

/** Rebuilds the public pages for a brand after its content changes. */
function revalidateBrand(brandKey: string) {
  revalidatePath("/", "layout");
  revalidatePath(`/${brandKey}`, "layout");
  revalidatePath("/admin/content");
}

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function saveService(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireUser();
    const brandKey = String(formData.get("brand_key") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!brandKey || !name) return { ok: false, message: "Name is required." };

    const slug = slugify(String(formData.get("slug") ?? "") || name);

    let faqs: { q: string; a: string }[] = [];
    const rawFaqs = String(formData.get("faqs") ?? "").trim();
    if (rawFaqs) {
      try {
        const parsed = JSON.parse(rawFaqs);
        if (!Array.isArray(parsed)) throw new Error("not an array");
        faqs = parsed.map((f) => ({ q: String(f.q ?? ""), a: String(f.a ?? "") }));
      } catch {
        return { ok: false, message: "FAQs must be a JSON array of {q, a} objects." };
      }
    }

    const row = {
      brand_key: brandKey,
      slug,
      name,
      short: String(formData.get("short") ?? ""),
      hero: String(formData.get("hero") ?? ""),
      intro: String(formData.get("intro") ?? ""),
      includes: lines(formData.get("includes")),
      why: String(formData.get("why") ?? ""),
      from: String(formData.get("from") ?? "quote") || "quote",
      faqs,
      position: Number(formData.get("position") ?? 0) || 0,
    };

    const db = createAdminClient();
    const { error } = await db
      .from("services")
      .upsert(row, { onConflict: "brand_key,slug" });
    if (error) return { ok: false, message: error.message };

    revalidateBrand(brandKey);
    return { ok: true, message: `Saved “${name}”.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed." };
  }
}

export async function saveCity(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireUser();
    const brandKey = String(formData.get("brand_key") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!brandKey || !name) return { ok: false, message: "Name is required." };

    const note = String(formData.get("note") ?? "").trim();
    const row = {
      brand_key: brandKey,
      slug: slugify(String(formData.get("slug") ?? "") || name),
      name,
      region: String(formData.get("region") ?? ""),
      tier: String(formData.get("tier") ?? ""),
      known_for: String(formData.get("known_for") ?? ""),
      note: note || null,
      position: Number(formData.get("position") ?? 0) || 0,
    };

    const db = createAdminClient();
    const { error } = await db
      .from("cities")
      .upsert(row, { onConflict: "brand_key,slug" });
    if (error) return { ok: false, message: error.message };

    revalidateBrand(brandKey);
    return { ok: true, message: `Saved “${name}”.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed." };
  }
}

export async function saveNiche(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  try {
    await requireUser();
    const brandKey = String(formData.get("brand_key") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    if (!brandKey || !name) return { ok: false, message: "Name is required." };

    const row = {
      brand_key: brandKey,
      slug: slugify(String(formData.get("slug") ?? "") || name),
      name,
      line: String(formData.get("line") ?? ""),
      position: Number(formData.get("position") ?? 0) || 0,
    };

    const db = createAdminClient();
    const { error } = await db
      .from("niches")
      .upsert(row, { onConflict: "brand_key,slug" });
    if (error) return { ok: false, message: error.message };

    revalidateBrand(brandKey);
    return { ok: true, message: `Saved “${name}”.` };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Failed." };
  }
}

export async function deleteRow(formData: FormData): Promise<void> {
  await requireUser();
  const table = String(formData.get("table") ?? "");
  const brandKey = String(formData.get("brand_key") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!["services", "cities", "niches"].includes(table) || !brandKey || !slug) return;

  const db = createAdminClient();
  await db.from(table).delete().eq("brand_key", brandKey).eq("slug", slug);
  revalidateBrand(brandKey);
}
