import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-balance font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-balance text-lg text-muted-foreground">{description}</p>
      )}
    </Reveal>
  );
}
