import { PlayCircle, FileText, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";
import { DemoRequestDialog } from "./demo-request-dialog";
import { listFreeResources } from "@/lib/store/marketing";

const ICONS = {
  demo: PlayCircle,
  pdf: FileText,
  test: ClipboardCheck,
} as const;

export function FreeResources() {
  const freeResources = listFreeResources();
  if (freeResources.length === 0) return null;

  return (
    <section className="border-b py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {freeResources.map((resource, i) => {
            const Icon = ICONS[resource.type];
            return (
              <Reveal key={resource.id} delay={i * 0.08}>
                <Card className="h-full">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-foreground">
                      <Icon className="size-5 text-background" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-lg font-semibold">{resource.title}</p>
                      <p className="mt-1 text-[15px] text-muted-foreground">
                        {resource.description}
                      </p>
                      {resource.type === "demo" ? (
                        <DemoRequestDialog
                          variant="link"
                          size="default"
                          className="mt-1 h-auto px-0"
                          label="Get it free →"
                        />
                      ) : (
                        <Button
                          render={<a href={resource.url} target="_blank" rel="noopener noreferrer" />}
                          variant="link"
                          className="mt-1 h-auto px-0"
                        >
                          Get it free &rarr;
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
