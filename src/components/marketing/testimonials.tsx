import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export async function TestimonialsGrid() {
  const testimonials = await listTestimonials();

  if (testimonials.length === 0) {
    return (
      <p className="mx-auto max-w-md text-center text-muted-foreground">
        Testimonials from our first batches will appear here soon.
      </p>
    );
  }

  return (
    // Phones: one swipeable rail (a long vertical stack is tedious to scroll).
    // sm+: a regular grid.
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pt-2 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pt-0 sm:pb-0 lg:grid-cols-3">
      {testimonials.map((testimonial, i) => (
        <Reveal
          key={testimonial.id}
          delay={(i % 3) * 0.08}
          className="w-[85%] shrink-0 snap-start sm:w-auto"
        >
          <Card className="card-hover h-full rounded-2xl">
            <CardContent className="flex h-full flex-col gap-4 pt-6">
              <p className="flex-1 text-[15px] leading-relaxed text-muted-foreground">
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
  );
}
