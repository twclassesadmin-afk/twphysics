"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Atom, FlaskConical, Sigma } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const SUBJECTS = [
  { icon: Atom, label: "Physics" },
  { icon: FlaskConical, label: "Chemistry" },
  { icon: Sigma, label: "Maths" },
];

const SLIDES = ["Meet your tutor", "Your dashboard"] as const;
const INTERVAL_MS = 5000;

function TutorSlide() {
  return (
    // Raw cutout, no frame — the bottom fades out so the cropped arms melt into the hero.
    <div className="relative size-full [mask-image:linear-gradient(to_bottom,black_78%,transparent)]">
      <Image
        src="/tutor.png"
        alt="TWPHYSICS lead tutor"
        fill
        priority
        sizes="(min-width: 1024px) 22rem, 80vw"
        className="object-contain object-bottom"
      />
    </div>
  );
}

function DashboardSlide() {
  return (
    <div className="flex size-full items-center">
      <Card className="glass w-full gap-0 overflow-hidden shadow-2xl shadow-primary/10">
        <CardContent className="space-y-5 p-6">
          <Badge variant="outline" className="text-[11px] text-muted-foreground">
            Your dashboard, in preview
          </Badge>
          <div>
            <p className="font-heading text-lg font-semibold">Physics — Thermodynamics</p>
            <p className="text-sm text-muted-foreground">Today, 5:00 PM</p>
          </div>
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Syllabus progress</span>
              <span className="font-medium tabular-nums">72%</span>
            </div>
            <Progress value={72} />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Attendance</span>
              <span className="font-medium tabular-nums">94%</span>
            </div>
            <Progress value={94} />
          </div>
          <div className="flex gap-2 border-t pt-4">
            {SUBJECTS.map((subject) => (
              <div
                key={subject.label}
                className="flex flex-1 flex-col items-center gap-1.5 rounded-lg bg-secondary py-2.5"
              >
                <subject.icon className="size-4 text-primary" strokeWidth={1.75} />
                <span className="text-[11px] text-muted-foreground">{subject.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function HeroShowcase() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  // Re-arms whenever the slide changes, so a manual dot click gets a full interval.
  useEffect(() => {
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [index]);

  const offset = reduceMotion ? 0 : 60;

  return (
    <div className="relative w-full max-w-[22rem]">
      <div className="relative aspect-[738/900] w-full">
        <AnimatePresence initial>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, x: offset, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -offset, scale: 0.96 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {index === 0 ? <TutorSlide /> : <DashboardSlide />}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-5 flex justify-center gap-2">
        {SLIDES.map((label, i) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-foreground" : "w-1.5 bg-foreground/25 hover:bg-foreground/40"}`}
          />
        ))}
      </div>
    </div>
  );
}
