import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE = "duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]";

export function CtaButton({
  href,
  children,
  variant = "primary",
  size = "default",
  className,
  external,
}: {
  href: string;
  children: string;
  variant?: "primary" | "inverted" | "outline";
  size?: "default" | "lg";
  className?: string;
  external?: boolean;
}) {
  const Comp = external ? "a" : Link;
  const linkProps = external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };

  return (
    <Comp
      {...linkProps}
      className={cn(
        "group inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full py-2 pr-2 pl-6 font-medium transition-colors",
        size === "lg" ? "text-base" : "text-sm",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "inverted" && "bg-background text-foreground hover:bg-background/90",
        variant === "outline" && "border border-border bg-transparent text-foreground hover:bg-muted",
        className,
      )}
    >
      <span className="relative h-5 overflow-hidden">
        <span
          className={cn(
            "flex flex-col transition-transform group-hover:-translate-y-1/2",
            EASE,
          )}
        >
          <span className="h-5 leading-5">{children}</span>
          <span className="h-5 leading-5" aria-hidden>
            {children}
          </span>
        </span>
      </span>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full transition-transform group-hover:-rotate-45",
          EASE,
          size === "lg" ? "size-8" : "size-7",
          variant === "primary" && "bg-primary-foreground text-primary",
          variant === "inverted" && "bg-foreground text-background",
          variant === "outline" && "bg-foreground text-background",
        )}
      >
        <ArrowRight className="size-3.5" />
      </span>
    </Comp>
  );
}
