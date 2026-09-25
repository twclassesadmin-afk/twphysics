"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepProgress({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-start">
      {steps.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "active" : "pending";
        return (
          <div key={label} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                  state === "done" && "bg-primary text-primary-foreground",
                  state === "active" && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  state === "pending" && "bg-muted text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="size-4" strokeWidth={3} /> : n}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium whitespace-nowrap",
                  state === "pending" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="mx-2 h-0.5 flex-1 -translate-y-3.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full bg-primary transition-all duration-500 ease-out",
                    n < current ? "w-full" : "w-0",
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
