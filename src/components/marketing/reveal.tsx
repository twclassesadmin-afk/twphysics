"use client";

import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  className,
  y = 24,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Default to visible — an element only gets hidden-then-revealed treatment
  // once we've confirmed (on mount) that it actually starts off-screen. This
  // guarantees content is never stuck invisible if the observer never fires.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const rect = el.getBoundingClientRect();
    const startsOffscreen = rect.top > window.innerHeight * 0.9;
    if (!startsOffscreen) return;

    setVisible(false);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);

    // Safety net: never leave content permanently invisible if the observer
    // fails to fire (resize races, fast programmatic scrolling, etc.).
    const fallback = window.setTimeout(() => setVisible(true), 500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
