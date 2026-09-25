import { Atom, FlaskConical, Sigma, GraduationCap } from "lucide-react";
import { SectionHeading } from "./section-heading";

const SUBJECTS = [
  { icon: Atom, label: "Physics", angle: -90, color: "var(--chart-1)" },
  { icon: FlaskConical, label: "Chemistry", angle: 30, color: "var(--chart-2)" },
  { icon: Sigma, label: "Maths", angle: 150, color: "var(--chart-3)" },
];

const EXAMS = [
  { label: "NEET", angle: -90 },
  { label: "JEE Main", angle: 30 },
  { label: "EAPCET", angle: 150 },
];

export const STUDY_HEADING = {
  eyebrow: "What you'll study",
  title: "One platform, every subject, every exam",
  description:
    "MPC coverage built around the exams that matter — Physics, Chemistry and Maths, mapped straight to NEET, JEE Main and EAPCET.",
};

export function OrbitVisual({ className }: { className?: string }) {
  return (
    <div className={`relative mx-auto flex h-[21rem] items-center justify-center sm:h-[25rem] ${className ?? ""}`}>
      <div className="absolute top-1/2 left-1/2 size-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-foreground/15 sm:size-[23rem]">
        {EXAMS.map((exam) => (
          <div
            key={exam.label}
            className="absolute top-0 left-1/2 h-1/2 -ml-14 origin-bottom"
            style={
              {
                "--start-angle": `${exam.angle}deg`,
                animation: "orbit-ccw 34s linear infinite",
              } as React.CSSProperties
            }
          >
            <div
              className="-mt-3.5 flex justify-center"
              style={
                {
                  "--counter-offset": `${-exam.angle}deg`,
                  animation: "counter-ccw 34s linear infinite",
                } as React.CSSProperties
              }
            >
              <span className="rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap shadow-sm">
                {exam.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 size-[11rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/15 sm:size-[13rem]">
        {SUBJECTS.map((subject) => (
          <div
            key={subject.label}
            className="absolute top-0 left-1/2 h-1/2 -ml-7 origin-bottom"
            style={
              {
                "--start-angle": `${subject.angle}deg`,
                animation: "orbit-cw 22s linear infinite",
              } as React.CSSProperties
            }
          >
            <div
              className="-mt-7 flex flex-col items-center gap-1.5"
              style={
                {
                  "--counter-offset": `${-subject.angle}deg`,
                  animation: "counter-cw 22s linear infinite",
                } as React.CSSProperties
              }
            >
              <div
                className="flex size-14 items-center justify-center rounded-full bg-card shadow-md"
                style={{ color: subject.color, boxShadow: `0 4px 18px -4px ${subject.color}` }}
              >
                <subject.icon className="size-6" strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-medium whitespace-nowrap text-muted-foreground">
                {subject.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-warm shadow-xl shadow-foreground/10">
        <div
          className="absolute inset-0 -z-10 rounded-full bg-gradient-warm opacity-60 blur-2xl motion-drift"
          style={{ animation: "drift 6s ease-in-out infinite" }}
        />
        <GraduationCap className="size-8 text-white" strokeWidth={1.75} />
      </div>
    </div>
  );
}

export function SubjectsOrbit() {
  return (
    <section className="relative overflow-hidden border-b bg-pink-band py-20 sm:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          number={1}
          eyebrow={STUDY_HEADING.eyebrow}
          title={STUDY_HEADING.title}
          description={STUDY_HEADING.description}
        />
        <OrbitVisual className="mt-16" />
      </div>
    </section>
  );
}
