"use client";

import { useRef, useState } from "react";
import { trackLead } from "@/lib/track";

interface Props {
  brand: string;
  service: string;
  city: string;
  sourceUrl: string;
}

type State = "idle" | "sending" | "done" | "error";

export default function LeadForm({ brand, service, city, sourceUrl }: Props) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  // When the visitor first touched the form, so the server can tell a person
  // filling it in from a bot posting instantly.
  const startedAt = useRef<number | null>(null);

  function markStart() {
    if (startedAt.current === null) startedAt.current = Date.now();
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setError("");

    try {
      const res = await fetch("/api/leads/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand,
          service,
          city,
          source_url: sourceUrl,
          name: String(data.get("name") ?? ""),
          phone: String(data.get("phone") ?? ""),
          message: String(data.get("message") ?? ""),
          company: String(data.get("company") ?? ""),
          elapsed_ms: startedAt.current ? Date.now() - startedAt.current : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "" }));
        throw new Error(body.error || "Could not send that. Please call us instead.");
      }
      trackLead({ brand, service, city });
      form.reset();
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card glow formok" role="status">
        <div className="tick" aria-hidden="true">✓</div>
        <h3 style={{ marginBottom: 6 }}>Thanks — we have your request.</h3>
        <p className="muted" style={{ margin: 0 }}>
          We reply within the hour during working hours.
        </p>
      </div>
    );
  }

  return (
    <form className="lead" onSubmit={onSubmit} onFocus={markStart}>
      {/* Honeypot. Hidden from people and from screen readers; only bots fill it. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="lead-company">Company</label>
        <input id="lead-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="field">
        <label htmlFor="lead-name">Your name</label>
        <input
          id="lead-name"
          name="name"
          required
          autoComplete="name"
          placeholder="Priya Sharma"
          onChange={markStart}
        />
      </div>
      <div className="field">
        <label htmlFor="lead-phone">Phone</label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="+91 98765 43210"
          onChange={markStart}
        />
      </div>
      <div className="field">
        <label htmlFor="lead-message">What do you need?</label>
        <textarea
          id="lead-message"
          name="message"
          rows={3}
          placeholder="A short brief, timeline, or budget range."
          onChange={markStart}
        />
      </div>
      <button className="btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Request a callback"}
      </button>
      {state === "error" ? (
        <p className="formnote err" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
