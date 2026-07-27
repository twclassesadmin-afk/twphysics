import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { listCourses, getCourseSeatsLeft } from "@/lib/store/batches";

export function CourseCards() {
  const courses = listCourses();

  return (
    <section id="courses" className="border-b bg-secondary/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Courses"
          title="Choose your track"
          description="Pick your exam track, then choose your batch size below for the fee schedule."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {courses.map((course, i) => {
            const seatsLeft = getCourseSeatsLeft(course.id);
            return (
              <Reveal key={course.id} delay={i * 0.08}>
                <Card className="flex h-full flex-col">
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
                    <p className="text-sm text-muted-foreground">{course.durationMonths}-month program</p>
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
                    <Button render={<Link href={`/signup?course=${course.id}`} />} size="lg" className="w-full">
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
