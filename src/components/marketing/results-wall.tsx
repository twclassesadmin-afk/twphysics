import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { listResults } from "@/lib/store/marketing";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function ResultsWall() {
  const results = await listResults();
  if (results.length === 0) return null;

  return (
    <section id="results" className="border-b py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          number={5}
          eyebrow="Results"
          title="Numbers our students are proud of"
          description="Real ranks, real scores — verified against admit cards at enrollment renewal."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((result, i) => (
            <Reveal key={result.id} delay={i * 0.06}>
              <Card className="card-hover h-full rounded-2xl">
                <CardContent className="flex flex-col items-center gap-2 pt-6 text-center">
                  <Avatar className="size-14">
                    <AvatarFallback className="bg-secondary font-heading font-semibold text-foreground">
                      {initials(result.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-heading text-lg font-semibold">{result.name}</p>
                  <Badge>{result.rank}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {result.exam} &middot; {result.score}
                  </p>
                  <p className="mt-1 text-[15px] italic text-muted-foreground">
                    &ldquo;{result.quote}&rdquo;
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
