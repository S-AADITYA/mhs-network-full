import Link from "next/link";
import "./admin.css";
import SignOut from "./SignOut";
import { hasPublicSupabase } from "@/lib/supabase/env";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let email: string | null = null;
  if (hasPublicSupabase()) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? null;
  }

  return (
    <div className="admin">
      <header className="top wide">
        <div className="bar">
          <Link className="brandmark" href="/admin/">
            <span className="chip">M</span>
            Admin
          </Link>
          {email ? (
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
          ) : null}
        </div>
      </header>
      <main className="wrap-wide">{children}</main>
    </div>
  );
}
