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
    <Card size="sm">
      <CardContent className="flex items-center gap-2.5 sm:gap-4">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-10",
            tone === "warning" && "bg-destructive/10 text-destructive",
            tone === "success" && "bg-success/10 text-success",
            tone === "default" && "bg-primary/10 text-primary",
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
