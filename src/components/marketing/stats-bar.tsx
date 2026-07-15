"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { liveStats } from "@/lib/mock-data";

const STAT_ITEMS = [
  { label: "Students Enrolled", value: liveStats.studentsEnrolled },
  { label: "Classes Conducted", value: liveStats.classesConducted },
  { label: "Avg. Rank Improvement", value: liveStats.avgRankImprovement },
  { label: "Active Batches", value: liveStats.activeBatches },
];

export function StatsBar() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current || typeof IntersectionObserver === "undefined") return;

    const counters = Array.from(
      rootRef.current.querySelectorAll<HTMLElement>("[data-stat-value]"),
    );

    function animateCounter(el: HTMLElement) {
      const target = Number(el.dataset.statValue);
      const counter = { value: 0 };
      gsap.to(counter, {
        value: target,
        duration: 1.6,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = `${Math.round(counter.value).toLocaleString("en-IN")}+`;
        },
      });
    }

    // Element already on screen at mount (e.g. it's the first section a user
    // sees) — animate immediately rather than waiting on an observer that may
    // never fire if it's already "intersecting" before observation starts.
    const rect = rootRef.current.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      counters.forEach(animateCounter);
      return;
    }

    let done = false;
    function runOnce() {
      if (done) return;
      done = true;
      counters.forEach(animateCounter);
      observer.disconnect();
      window.clearTimeout(fallback);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) runOnce();
      },
      { threshold: 0.2 },
    );
    observer.observe(rootRef.current);

    // Safety net: guarantee the real numbers render even if the observer
    // never fires (resize races, fast programmatic scrolling, etc.).
    const fallback = window.setTimeout(runOnce, 500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden border-b bg-primary text-primary-foreground"
    >
      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        {STAT_ITEMS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p
              data-stat-value={stat.value}
              className="font-heading text-3xl font-semibold tabular-nums sm:text-4xl"
            >
              0+
            </p>
            <p className="mt-1.5 text-sm text-primary-foreground/70 sm:text-base">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
