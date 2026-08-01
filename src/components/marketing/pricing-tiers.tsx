import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { listPricingTiers } from "@/lib/store/pricing";

// Client-confirmed: billed yearly in 3 equal terms (4 months each), not
// monthly — monthlyFeeInr is the unit rate a term is computed from.
const YEARLY_TERM_MONTHS = 4;

export async function PricingTiers() {
  const tiers = await listPricingTiers();

  if (tiers.length === 0) return null;

  return (
    <section id="fees" className="border-b py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Fee structure"
          title="Pick your batch size"
          description="A smaller batch means more individual attention — choose what fits. Every tier covers Physics, Chemistry, and your third subject, billed yearly in 3 terms."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, i) => {
            const recommended = tiers.length === 3 && i === 1;
            return (
              <Reveal key={tier.id} delay={i * 0.08}>
                <Card
                  className={
                    recommended
                      ? "relative flex h-full flex-col border-primary/40 shadow-xl shadow-primary/10 ring-2 ring-primary/20"
                      : "flex h-full flex-col"
                  }
                >
                  {recommended && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-warm text-accent-warm-foreground">
                      Most chosen
                    </Badge>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-heading text-xl font-semibold">{tier.label}</CardTitle>
                      <Badge variant="secondary">{tier.batchSize} students</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tier.subjectsCount} subjects · {tier.daysPerSubjectPerMonth} days/subject/month
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="font-heading text-4xl font-semibold tabular-nums">
                      &#8377;{(tier.monthlyFeeInr * YEARLY_TERM_MONTHS).toLocaleString("en-IN")}
                      <span className="text-base font-normal text-muted-foreground">/term</span>
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Billed yearly in 3 terms &middot; &#8377;{tier.monthlyFeeInr.toLocaleString("en-IN")}/mo rate
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button render={<Link href="/signup" />} size="lg" className="w-full">
                      Enroll Now
                    </Button>
                  </CardFooter>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
