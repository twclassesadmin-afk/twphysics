"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { SectionHeading } from "./section-heading";
import { OrbitVisual, STUDY_HEADING } from "./subjects-orbit";
import { APPROACH_HEADING, PILLARS } from "./our-approach";

// Desktop-only pinned section: the stage stays put on one pink background while
// scroll progress swaps heading 1 → heading 2, shrinks the orbit away to
// nothing, then slides the approach pillars in from both sides. Mobile renders
// the two sections statically instead (see page.tsx).
//
// Timeline (fraction of the section's scroll):
//   0.00–0.12  hold on "What you'll study"
//   0.12–0.34  orbit shrinks + fades out, headings swap
//   0.32–0.62  pillars slide in (left column from the left, right from the right)
//   0.62–1.00  hold on the finished grid so fast scrollers still see it

type Pillar = (typeof PILLARS)[number];

function PillarCard({ pillar, progress, index }: { pillar: Pillar; progress: MotionValue<number>; index: number }) {
  const fromLeft = index % 2 === 0;
  const start = 0.32 + index * 0.06;
  const range = [start, start + 0.12];
  const x = useTransform(progress, range, [fromLeft ? -480 : 480, 0]);
  const opacity = useTransform(progress, range, [0, 1]);

  return (
    <motion.div
      style={{ x, opacity }}
      className="rounded-2xl border border-foreground/10 bg-card/85 p-6 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/20">
          <pillar.icon className="size-5 text-primary-foreground" strokeWidth={2} />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold tracking-tight">{pillar.title}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{pillar.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export function StudyApproachScroll({ className }: { className?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Spring-smooth the raw scroll value so wheel "steps" on laptops glide.
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  const studyOpacity = useTransform(progress, [0.12, 0.24], [1, 0]);
  const studyY = useTransform(progress, [0.12, 0.24], [0, -40]);
  const approachOpacity = useTransform(progress, [0.22, 0.34], [0, 1]);
  const approachY = useTransform(progress, [0.22, 0.34], [40, 0]);
  const orbitScale = useTransform(progress, [0.12, 0.32], [0.9, 0]);
  const orbitOpacity = useTransform(progress, [0.18, 0.3], [1, 0]);

  return (
    <section ref={ref} className={`relative h-[420vh] border-b bg-pink-band ${className ?? ""}`}>
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

        <div className="relative mx-auto flex min-h-0 w-full max-w-4xl flex-1 items-center justify-center px-6 pb-6">
          <motion.div
            style={{ scale: orbitScale, opacity: orbitOpacity }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <OrbitVisual className="w-[25rem]" />
          </motion.div>
          <div className="relative grid w-full grid-cols-2 gap-5">
            {PILLARS.map((pillar, i) => (
              <PillarCard key={pillar.title} pillar={pillar} progress={progress} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
