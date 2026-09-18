"use client";

import { useActionState } from "react";
import {
  saveCity,
  saveNiche,
  saveService,
  type ActionResult,
} from "../../actions";
import type { City, Niche, Service } from "@/lib/types";

function Note({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p className={`formnote ${state.ok ? "ok" : "err"}`}>{state.message}</p>
  );
}

export function ServiceForm({
  brandKey,
  service,
  position,
}: {
  brandKey: string;
  service?: Service;
  position?: number;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveService,
    null,
  );

  return (
    <form action={action}>
      <input type="hidden" name="brand_key" value={brandKey} />
      <input type="hidden" name="position" value={position ?? 0} />
      <div className="field">
        <label>Name</label>
        <input name="name" defaultValue={service?.name} required />
      </div>
      <div className="field">
        <label>
          URL slug
          <span className="hint">
            Leave blank to generate. Changing this changes the page URL.
          </span>
        </label>
        <input name="slug" defaultValue={service?.slug} placeholder="auto" />
      </div>
      <div className="field">
        <label>Short label <span className="hint">Used mid-sentence, lowercase.</span></label>
        <input name="short" defaultValue={service?.short} />
      </div>
      <div className="field">
        <label>Hero line</label>
        <input name="hero" defaultValue={service?.hero} />
      </div>
      <div className="field">
        <label>Intro paragraph</label>
        <textarea name="intro" rows={3} defaultValue={service?.intro} />
      </div>
      <div className="field">
        <label>
          What&rsquo;s included <span className="hint">One per line.</span>
        </label>
        <textarea
          name="includes"
          rows={4}
          defaultValue={service?.includes.join("\n")}
        />
      </div>
      <div className="field">
        <label>Why it matters</label>
        <textarea name="why" rows={3} defaultValue={service?.why} />
      </div>
      <div className="field">
        <label>
          Starting price <span className="hint">A number, or &ldquo;quote&rdquo;.</span>
        </label>
        <input name="from" defaultValue={service?.from ?? "quote"} />
      </div>
      <div className="field">
        <label>
          FAQs <span className="hint">JSON array of {`{"q": "...", "a": "..."}`}</span>
        </label>
        <textarea
          name="faqs"
          rows={6}
          defaultValue={JSON.stringify(service?.faqs ?? [], null, 2)}
        />
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : service ? "Save changes" : "Add service"}
      </button>
      <Note state={state} />
    </form>
  );
}

export function CityForm({
  brandKey,
  city,
  position,
}: {
  brandKey: string;
  city?: City;
  position?: number;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveCity,
    null,
  );

  return (
    <form action={action}>
      <input type="hidden" name="brand_key" value={brandKey} />
      <input type="hidden" name="position" value={position ?? 0} />
      <div className="field">
        <label>Name</label>
        <input name="name" defaultValue={city?.name} required />
      </div>
      <div className="field">
        <label>URL slug</label>
        <input name="slug" defaultValue={city?.slug} placeholder="auto" />
      </div>
      <div className="field">
        <label>Region / state</label>
        <input name="region" defaultValue={city?.region} />
      </div>
      <div className="field">
        <label>Tier <span className="hint">metro, tier-2, area…</span></label>
        <input name="tier" defaultValue={city?.tier} />
      </div>
      <div className="field">
        <label>
          Known for
          <span className="hint">
            Completes &ldquo;{"{city}"} is …&rdquo;. This is what keeps pages distinct.
          </span>
        </label>
        <input name="known_for" defaultValue={city?.known_for} />
      </div>
      <div className="field">
        <label>
          Custom note
          <span className="hint">
            Optional. Overrides the generated paragraph entirely — the strongest
            signal against duplicate content.
          </span>
        </label>
        <textarea name="note" rows={3} defaultValue={city?.note ?? ""} />
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : city ? "Save changes" : "Add location"}
      </button>
      <Note state={state} />
    </form>
  );
}

export function NicheForm({
  brandKey,
  niche,
  position,
}: {
  brandKey: string;
  niche?: Niche;
  position?: number;
}) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    saveNiche,
    null,
  );

  return (
    <form action={action}>
      <input type="hidden" name="brand_key" value={brandKey} />
      <input type="hidden" name="position" value={position ?? 0} />
      <div className="field">
        <label>Name</label>
        <input name="name" defaultValue={niche?.name} required />
      </div>
      <div className="field">
        <label>URL slug</label>
        <input name="slug" defaultValue={niche?.slug} placeholder="auto" />
      </div>
      <div className="field">
        <label>
          Descriptive line <span className="hint">Used mid-sentence, lowercase.</span>
        </label>
        <input name="line" defaultValue={niche?.line} />
      </div>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Saving…" : niche ? "Save changes" : "Add category"}
      </button>
      <Note state={state} />
    </form>
  );
}
