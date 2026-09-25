import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  number,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  number?: number;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <div className="flex items-center justify-center gap-2.5">
          {number !== undefined && (
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {number}
            </span>
          )}
          <span className="rounded-full border border-border px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="mt-4 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-balance text-lg text-muted-foreground">{description}</p>
      )}
    </Reveal>
  );
}
