"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Fades content up as it scrolls into view. Elements start hidden via CSS, so
 * if JS never runs the observer below still unhides them on mount.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      node.classList.add("in");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          window.setTimeout(() => entry.target.classList.add("in"), delay);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(node);

    // Failsafe: content must never stay hidden because an animation did not
    // fire. If the observer has not revealed this block shortly after mount,
    // reveal it regardless.
    const failsafe = window.setTimeout(() => node.classList.add("in"), 1800);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal ${className}`.trim()}>
      {children}
    </Tag>
  );
}

/**
 * Tracks the pointer across a card grid and writes it to CSS custom properties,
 * which drives the radial highlight in .grid a::before.
 */
export function GlowGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    function onMove(event: PointerEvent) {
      const card = (event.target as HTMLElement).closest("a");
      if (!card) return;
      const box = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - box.left}px`);
      card.style.setProperty("--my", `${event.clientY - box.top}px`);
    }

    node.addEventListener("pointermove", onMove);
    return () => node.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <ul ref={ref} className={`grid ${className}`.trim()}>
      {children}
    </ul>
  );
}

/** Ambient animated background. Purely decorative. */
export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <i />
    </div>
  );
}
