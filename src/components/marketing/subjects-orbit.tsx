import { Atom, FlaskConical, Sigma, GraduationCap } from "lucide-react";
import { SectionHeading } from "./section-heading";

const SUBJECTS = [
  { icon: Atom, label: "Physics", angle: -90 },
  { icon: FlaskConical, label: "Chemistry", angle: 30 },
  { icon: Sigma, label: "Maths", angle: 150 },
];

const EXAMS = [
  { label: "NEET", angle: -90 },
  { label: "JEE Main", angle: 30 },
  { label: "EAPCET", angle: 150 },
];

export function SubjectsOrbit() {
  return (
    <section className="overflow-hidden border-b py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="What you'll study"
          title="One platform, every subject, every exam"
          description="MPC coverage built around the exams that matter — Physics, Chemistry and Maths, mapped straight to NEET, JEE Main and EAPCET."
        />
        <div className="relative mx-auto mt-16 flex h-[21rem] items-center justify-center sm:h-[25rem]">
          <div className="absolute top-1/2 left-1/2 size-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border sm:size-[23rem]">
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

          <div className="absolute top-1/2 left-1/2 size-[11rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border sm:size-[13rem]">
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
                  <div className="flex size-14 items-center justify-center rounded-full border bg-card shadow-md">
                    <subject.icon className="size-6 text-primary" strokeWidth={1.75} />
                  </div>
                  <span className="text-[11px] font-medium whitespace-nowrap text-muted-foreground">
                    {subject.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="relative flex size-20 items-center justify-center rounded-full bg-primary shadow-xl shadow-primary/30">
            <div
              className="absolute inset-0 -z-10 rounded-full bg-primary/40 blur-2xl"
              style={{ animation: "drift 6s ease-in-out infinite" }}
            />
            <GraduationCap className="size-8 text-primary-foreground" strokeWidth={1.75} />
          </div>
        </div>
      </div>
    </section>
  );
}
