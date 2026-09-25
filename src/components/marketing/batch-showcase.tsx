import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { listBatches, getBatchFilledCount } from "@/lib/store/batches";

export async function BatchShowcase() {
  const rawBatches = await listBatches();
  const batches = await Promise.all(
    rawBatches.map(async (batch) => ({ ...batch, filled: await getBatchFilledCount(batch.id) })),
  );

  return (
    <section id="batches" className="border-b bg-tint-sky py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          number={6}
          eyebrow="Open batches"
          title="Seats are filling up"
          description="Real capacity, not fake urgency — this reflects actual batch enrollment."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {batches.map((batch, i) => {
            const { filled } = batch;
            const seatsLeft = batch.capacity - filled;
            const fillPct = Math.round((filled / batch.capacity) * 100);
            return (
              <Reveal key={batch.id} delay={i * 0.08}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="font-heading text-lg">{batch.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Starts {new Date(batch.startDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2.5">
                    <Progress value={fillPct} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {filled}/{batch.capacity} seats filled &middot;{" "}
                      <span className="font-semibold text-foreground">{seatsLeft} left</span>
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button render={<Link href="/signup" />} variant="outline" size="lg" className="w-full">
                      Join Waitlist
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
