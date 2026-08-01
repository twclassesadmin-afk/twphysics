import { Reveal } from "./reveal";

const FACTS = [
  { value: "3", label: "Core subjects — Physics, Chemistry & Maths" },
  { value: "9 / 5 / 3", label: "Batch sizes to choose from" },
  { value: "12", label: "Class days per subject, every month" },
  { value: "24 Hrs", label: "Doubt-clearing turnaround" },
];

export function StatsBar() {
  return (
    <section className="border-b bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        {FACTS.map((fact, i) => (
          <Reveal key={fact.label} delay={i * 0.08} className="text-center">
            <p className="font-heading text-3xl font-semibold tabular-nums sm:text-4xl">
              {fact.value}
            </p>
            <p className="mt-1.5 text-sm text-background/70 sm:text-base">{fact.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
