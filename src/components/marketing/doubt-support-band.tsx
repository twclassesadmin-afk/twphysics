import { CtaButton } from "@/components/ui/cta-button";
import { InteractiveRobot } from "./interactive-robot";

export function DoubtSupportBand() {
  return (
    <section className="overflow-hidden border-b bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl items-center px-4 sm:px-6 lg:grid-cols-2">
        {/* Desktop only — the 3D scene is too heavy for phones. */}
        <InteractiveRobot className="hidden h-[32rem] lg:-ml-16 lg:block" />
        <div className="flex flex-col items-center py-16 text-center sm:py-20 lg:items-start lg:pl-10 lg:text-left">
          <p className="text-sm font-bold uppercase tracking-wider text-background/60">Stuck on a doubt?</p>
          <h2 className="mt-3 max-w-xl text-balance font-heading text-3xl font-semibold sm:text-4xl">
            Ask, and hear back within 24 hours
          </h2>
          <p className="mt-3 max-w-md text-balance text-background/70">
            Every question you raise on your dashboard reaches your subject tutor directly — no
            ticket queues, no waiting for office hours.
          </p>
          <div className="mt-6">
            <CtaButton href="/signup" variant="inverted" size="lg">
              Get started
            </CtaButton>
          </div>
        </div>
      </div>
    </section>
  );
}
