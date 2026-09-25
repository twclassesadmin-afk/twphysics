"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { OrbitVisual, STUDY_HEADING } from "./subjects-orbit";
import { APPROACH_HEADING, PILLARS } from "./our-approach";

// Desktop-only pinned section: the stage stays put on one pink background while
// scroll progress swaps heading 1 → heading 2, shrinks the orbit, and slides
// the approach pillars in from both sides. Mobile renders the two sections
// statically instead (see page.tsx).

type Pillar = (typeof PILLARS)[number];

function PillarCard({
  pillar,
  progress,
  side,
  order,
}: {
  pillar: Pillar;
  progress: MotionValue<number>;
  side: "left" | "right";
  order: number;
}) {
  const start = 0.5 + order * 0.1;
  const range = [start, start + 0.22];
  const x = useTransform(progress, range, [side === "left" ? -420 : 420, 0]);
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <motion.div
      style={{ x, opacity }}
      className="rounded-2xl border border-foreground/10 bg-card/80 p-5 shadow-sm"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
        <pillar.icon className="size-5 text-primary-foreground" strokeWidth={2} />
      </div>
      <h3 className="mt-4 font-heading text-base font-semibold tracking-tight">{pillar.title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{pillar.description}</p>
    </motion.div>
  );
}

export function StudyApproachScroll({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Spring-smooth the raw scroll value so wheel "steps" on laptops glide.
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  const studyOpacity = useTransform(progress, [0.25, 0.4], [1, 0]);
  const studyY = useTransform(progress, [0.25, 0.4], [0, -40]);
  const approachOpacity = useTransform(progress, [0.36, 0.5], [0, 1]);
  const approachY = useTransform(progress, [0.36, 0.5], [40, 0]);
  const orbitScale = useTransform(progress, [0.25, 0.55], [0.9, 0.55]);

  const left = PILLARS.slice(0, 2);
  const right = PILLARS.slice(2);

  return (
    <section ref={ref} className={`relative h-[320vh] border-b bg-pink-band ${className ?? ""}`}>
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-6xl px-6 pt-10">
          <motion.div style={{ opacity: studyOpacity, y: studyY }} className="[grid-area:1/1]">
            <SectionHeading number={1} {...STUDY_HEADING} />
          </motion.div>
          <motion.div style={{ opacity: approachOpacity, y: approachY }} className="[grid-area:1/1]">
            <SectionHeading number={2} {...APPROACH_HEADING} />
          </motion.div>
        </div>

        <div className="relative mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 pb-6">
          <div className="flex flex-col gap-4">
            {left.map((pillar, i) => (
              <PillarCard key={pillar.title} pillar={pillar} progress={progress} side="left" order={i} />
            ))}
          </div>
          <motion.div style={{ scale: orbitScale }}>
            <OrbitVisual className="w-[25rem]" />
          </motion.div>
          <div className="flex flex-col gap-4">
            {right.map((pillar, i) => (
              <PillarCard key={pillar.title} pillar={pillar} progress={progress} side="right" order={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
