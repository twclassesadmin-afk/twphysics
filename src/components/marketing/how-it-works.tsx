import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { howItWorks } from "@/lib/mock-data";

export function HowItWorks() {
  return (
    <section className="border-b bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading number={6} eyebrow="Process" title="How it works" />
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((item, i) => (
            <Reveal key={item.step} delay={i * 0.08} className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-foreground font-heading text-base font-bold text-background">
                {item.step}
              </div>
              <p className="mt-5 font-heading text-lg font-semibold">{item.title}</p>
              <p className="mt-1.5 text-[15px] text-muted-foreground">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
