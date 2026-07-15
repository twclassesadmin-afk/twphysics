import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { listTestimonials } from "@/lib/store/marketing";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  const testimonials = listTestimonials();
  if (testimonials.length === 0) return null;

  return (
    <section className="border-b py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Testimonials" title="What students and parents say" />
        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <Reveal key={testimonial.id} delay={i * 0.08}>
              <Card className="h-full">
                <CardContent className="flex flex-col gap-4 pt-6">
                  <p className="text-[15px] leading-relaxed text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-secondary text-sm font-semibold text-foreground">
                        {initials(testimonial.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
