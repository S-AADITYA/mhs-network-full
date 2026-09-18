"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export interface NavLink {
  href: string;
  label: string;
}

/**
 * Below the desktop breakpoint the inline nav is hidden, so this is the only
 * way to reach the other pages on a phone — which is most of the traffic.
 */
export default function MobileNav({
  links,
  callHref,
  callLabel,
}: {
  links: NavLink[];
  callHref?: string;
  callLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation, so the panel never covers the page it just opened.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="mobilenav">
      <button
        type="button"
        className="navtoggle"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={open ? "bars open" : "bars"} aria-hidden="true">
          <i />
          <i />
        </span>
      </button>

      {open ? (
        <>
          <div className="navscrim" onClick={() => setOpen(false)} />
          <div className="navpanel" id="mobile-menu" ref={panelRef}>
            <nav>
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                </Link>
              ))}
            </nav>
            {callHref ? (
              <a className="btn" href={callHref}>
                {callLabel}
              </a>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
