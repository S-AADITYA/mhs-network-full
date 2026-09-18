"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";

export default function SignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      className="btn ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClientSupabase().auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
