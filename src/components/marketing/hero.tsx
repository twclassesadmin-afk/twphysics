import { Badge } from "@/components/ui/badge";
import { CtaButton } from "@/components/ui/cta-button";
import { HeroHeading } from "./hero-heading";
import { HeroShowcase } from "./hero-showcase";

export function Hero() {
  return (
    <section className="grain overflow-hidden border-b bg-sunset">
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-14 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:text-left">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
            NEET &middot; JEE Main &middot; EAPCET
          </Badge>
          <HeroHeading
            text="NEET & IIT Preparation, Made Accessible to Everyone"
            className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-balance sm:text-5xl"
          />
          <p className="max-w-xl text-lg text-foreground/75 text-balance">
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

        <div className="order-last flex w-full shrink-0 justify-center lg:order-first lg:w-[22rem]">
          <HeroShowcase />
        </div>
      </div>
    </section>
  );
}
