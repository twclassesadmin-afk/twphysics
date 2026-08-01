import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";

const NOISE_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function AuthBrandPanel({
  eyebrow,
  title,
  accent,
  description,
  points,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  points: string[];
}) {
  return (
    <div className="relative hidden overflow-hidden bg-foreground px-10 py-12 text-background lg:flex lg:w-[42%] lg:shrink-0 lg:flex-col lg:justify-between xl:w-[38%]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: NOISE_BG }}
      />
      <div
        className="pointer-events-none absolute -top-1/4 -right-1/4 size-[26rem] rounded-full bg-primary/30 blur-3xl"
        style={{ animation: "drift 9s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute -bottom-1/3 -left-1/4 size-[22rem] rounded-full bg-accent-warm/20 blur-3xl"
        style={{ animation: "drift 12s ease-in-out infinite reverse" }}
      />

      <Link
        href="/"
        className="relative z-10 flex items-center gap-2.5 font-serif text-lg font-bold tracking-tight"
      >
        <Image src="/twlogo.jpeg" alt="TWPHYSICS" width={36} height={36} className="size-9 rounded-full" />
        TWPHYSICS
      </Link>

      <div className="relative z-10 space-y-6">
        <p className="text-sm font-bold uppercase tracking-wider text-background/60">{eyebrow}</p>
        <h2 className="font-serif text-3xl leading-tight text-balance sm:text-4xl">
          <span className="font-bold">{title}</span>
          {accent && <span className="italic text-primary"> {accent}</span>}
        </h2>
        <p className="max-w-sm text-[15px] leading-relaxed text-background/70">{description}</p>
        <ul className="space-y-3">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-[15px] text-background/85">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-background/50">&copy; {new Date().getFullYear()} TWPHYSICS</p>
    </div>
  );
}
