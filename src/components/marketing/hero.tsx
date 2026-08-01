import { Atom, FlaskConical, Sigma } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CtaButton } from "@/components/ui/cta-button";
import { HeroHeading } from "./hero-heading";

const SUBJECTS = [
  { icon: Atom, label: "Physics" },
  { icon: FlaskConical, label: "Chemistry" },
  { icon: Sigma, label: "Maths" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/60 to-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] -z-10 size-[26rem] rounded-full bg-primary/10 blur-3xl"
        style={{ animation: "drift 10s ease-in-out infinite" }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-center lg:text-left">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
            NEET &middot; JEE Main &middot; EAPCET
          </Badge>
          <HeroHeading
            text="NEET & IIT Preparation, Made Accessible to Everyone"
            className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          />
          <p className="max-w-xl text-lg text-muted-foreground text-balance">
            Live daily classes, structured syllabus tracking, and doubt-clearing
            within 24 hours — built for how toppers actually prepare.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <CtaButton href="/signup" size="lg">
              Register Now
            </CtaButton>
            <CtaButton href="#courses" variant="outline" size="lg">
              Explore Courses
            </CtaButton>
          </div>
        </div>

        <div className="hidden shrink-0 lg:block">
          <div className="relative w-[21rem]">
            <div className="absolute -inset-3 -z-10 rounded-[2rem] border border-primary/15" />
            <div
              className="pointer-events-none absolute -inset-6 -z-20 rounded-[2.5rem] bg-primary/15 blur-3xl"
              style={{ animation: "drift 8s ease-in-out infinite" }}
            />
            <Card className="glass gap-0 overflow-hidden shadow-2xl shadow-primary/10">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[11px] text-muted-foreground">
                    Your dashboard, in preview
                  </Badge>
                </div>
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
        </div>
      </div>
    </section>
  );
}
