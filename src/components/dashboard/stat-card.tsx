import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "warning" | "success";
}) {
  return (
    <Card size="sm" className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex items-center gap-2.5 sm:gap-4">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset sm:size-11",
            tone === "warning" && "bg-destructive/10 text-destructive ring-destructive/15",
            tone === "success" && "bg-success/10 text-success ring-success/15",
            tone === "default" && "bg-primary/10 text-primary ring-primary/15",
          )}
        >
          <Icon className="size-4 sm:size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold tabular-nums leading-tight sm:text-2xl">{value}</p>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
