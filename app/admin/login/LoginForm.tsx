"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (search.get("unconfigured")) {
    return (
      <div className="card">
        <p className="err" style={{ marginTop: 0 }}>
          Supabase is not configured.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>, then redeploy.
        </p>
      </div>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");

    const { error: authError } = await createClientSupabase().auth.signInWithPassword({
      email: String(data.get("email") ?? ""),
      password: String(data.get("password") ?? ""),
    });

    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }
    router.push(search.get("next") ?? "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        Password
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      <button className="submit" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      {error ? <p className="formnote err">{error}</p> : null}
    </form>
  );
}
