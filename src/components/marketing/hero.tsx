import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DemoRequestDialog } from "./demo-request-dialog";

export function Hero() {
  return (
    <section className="border-b bg-gradient-to-b from-secondary/60 to-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:text-left">
        <Image
          src="/alakh-pandey.jpg"
          alt=""
          width={360}
          height={360}
          priority
          className="hidden shrink-0 rounded-full object-cover lg:block lg:size-80"
        />
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
            NEET &middot; JEE Main &middot; EAPCET
          </Badge>
          <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            NEET &amp; IIT Preparation, Made Accessible to Everyone
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground text-balance">
            Live daily classes, structured syllabus tracking, and doubt-clearing
            within 24 hours — built for how toppers actually prepare.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <DemoRequestDialog size="lg" />
            <Button render={<a href="#courses" />} size="lg" variant="outline">
              Explore Courses
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
