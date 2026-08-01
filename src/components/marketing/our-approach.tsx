import { Radio, ListChecks, Users, MonitorSmartphone } from "lucide-react";
import { SectionHeading } from "./section-heading";

const PILLARS = [
  {
    icon: Radio,
    title: "Live daily classes",
    description: "Small-batch live sessions built for asking questions, not just watching.",
  },
  {
    icon: ListChecks,
    title: "Structured syllabus tracking",
    description: "Every topic has a deadline and a status — visible to you, your tutor, and your parents.",
  },
  {
    icon: MonitorSmartphone,
    title: "Online or offline",
    description: "Attend from home or in person — whichever fits your schedule better.",
  },
  {
    icon: Users,
    title: "Individual or group learning",
    description: "Pick the format that suits how you learn best.",
  },
];

export function OurApproach() {
  return (
    <section className="border-b py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why TWPHYSICS"
          title="Built differently, from day one"
          description="We're a new platform — so instead of asking you to trust a brand name, here's exactly how we teach."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className="group relative">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
                <pillar.icon className="size-6 text-primary-foreground" strokeWidth={2} />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold tracking-tight">
                {pillar.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
