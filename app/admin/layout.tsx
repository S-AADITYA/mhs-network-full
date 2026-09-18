import Link from "next/link";
import "./admin.css";
import SignOut from "./SignOut";
import { hasSupabase } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email: string | null = null;
  let isAdmin = false;

  if (hasSupabase()) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;

    if (user) {
      // Signed in is not the same as staff: this project allows public signup,
      // so membership of the allowlist is what actually grants access. The RLS
      // policies enforce it on the data; this only keeps the UI honest.
      const { data } = await supabase.rpc("mhs_is_admin");
      isAdmin = data === true;
    }
  }

  return (
    <div className="admin">
      <header className="top wide">
        <div className="bar">
          <Link className="brandmark" href="/admin/">
            <span className="chip" aria-hidden="true">M</span>
            Admin
          </Link>
          {email && isAdmin ? (
            <>
              <nav className="adminnav">
                <Link href="/admin/">Overview</Link>
                <Link href="/admin/leads/">Leads</Link>
                <Link href="/admin/content/">Content</Link>
                <Link href="/">View site</Link>
              </nav>
              <span className="who">{email}</span>
              <SignOut />
            </>
          ) : email ? (
            <>
              <span className="who">{email}</span>
              <SignOut />
            </>
          ) : null}
        </div>
      </header>

      <main className="wrap-wide">
        {email && !isAdmin ? (
          <div className="empty" style={{ marginTop: 40 }}>
            <h1 style={{ fontSize: "1.3rem" }}>This account has no access</h1>
            <p className="muted" style={{ margin: 0 }}>
              <strong>{email}</strong> is signed in but is not on the staff
              allowlist, so it cannot see leads or edit content. Add the address
              to <code>mhs_admins</code> to grant access.
            </p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
