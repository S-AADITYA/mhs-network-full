"use client";

import { useState } from "react";

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
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "" }));
        throw new Error(body.error || "Could not send that. Please call us instead.");
      }
      form.reset();
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card glow formok">
        <div className="tick">✓</div>
        <h3 style={{ marginBottom: 6 }}>Thanks — we have your request.</h3>
        <p className="muted" style={{ margin: 0 }}>
          We reply within the hour during working hours.
        </p>
      </div>
    );
  }

  return (
    <form className="lead" onSubmit={onSubmit}>
      <div className="field">
        <label htmlFor="lead-name">Your name</label>
        <input id="lead-name" name="name" required autoComplete="name" placeholder="Priya Sharma" />
      </div>
      <div className="field">
        <label htmlFor="lead-phone">Phone</label>
        <input
          id="lead-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+91 98765 43210"
        />
      </div>
      <div className="field">
        <label htmlFor="lead-message">What do you need?</label>
        <textarea
          id="lead-message"
          name="message"
          rows={3}
          placeholder="A short brief, timeline, or budget range."
        />
      </div>
      <button className="btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Request a callback"}
      </button>
      {state === "error" ? <p className="formnote err">{error}</p> : null}
    </form>
  );
}
