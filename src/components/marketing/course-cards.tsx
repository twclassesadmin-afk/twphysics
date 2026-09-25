import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CtaButton } from "@/components/ui/cta-button";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { listCourses, getCourseSeatsLeft } from "@/lib/store/batches";
import { listPricingTiers } from "@/lib/store/pricing";

export async function CourseCards() {
  const [rawCourses, pricingTiers] = await Promise.all([listCourses(), listPricingTiers()]);
  const courses = await Promise.all(
    rawCourses.map(async (course) => ({ ...course, seatsLeft: await getCourseSeatsLeft(course.id) })),
  );
  const startingFrom = pricingTiers.length > 0 ? Math.min(...pricingTiers.map((t) => t.monthlyFeeInr)) : null;

  return (
    <section id="courses" className="border-b bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          number={3}
          eyebrow="Courses"
          title="Choose your track"
          description="Pick your exam track, then choose your batch size below for the fee schedule."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {courses.map((course, i) => {
            const { seatsLeft } = course;
            return (
              <Reveal key={course.id} delay={i * 0.08}>
                <Card className="card-hover flex h-full flex-col rounded-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-heading text-2xl font-semibold">
                        {course.name}
                      </CardTitle>
                      {seatsLeft <= 10 && (
                        <Badge variant="destructive">Only {seatsLeft} seats left</Badge>
                      )}
                    </div>
                    <p className="text-[15px] text-muted-foreground">{course.tagline}</p>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-5">
                    <div>
                      <p className="text-sm text-muted-foreground">{course.durationMonths}-month program</p>
                      {startingFrom !== null && (
                        <p className="mt-1 text-sm">
                          Starting from{" "}
                          <span className="font-heading font-semibold text-foreground">
                            &#8377;{startingFrom.toLocaleString("en-IN")}/mo
                          </span>{" "}
                          &middot;{" "}
                          <a href="#fees" className="underline underline-offset-4">
                            see batch sizes
                          </a>
                        </p>
                      )}
                    </div>
                    <ul className="space-y-2.5">
                      {course.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2.5 text-[15px]">
                          <Check className="mt-0.5 size-4 shrink-0 text-success" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <CtaButton href={`/signup?course=${course.id}`} size="lg" className="w-full justify-center">
                      Enroll Now
                    </CtaButton>
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
