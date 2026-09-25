import Image from "next/image";

// Overview-page greeting. The illustrations are flat vectors on white/pale
// backgrounds, so mix-blend-multiply drops that backdrop into the gradient.
export function WelcomeBanner({
  eyebrow,
  title,
  description,
  image,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="grain overflow-hidden rounded-2xl border bg-dashboard-hero">
      <div className="flex items-center gap-6 px-5 py-5 sm:px-7 sm:py-6">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-semibold tracking-wider text-foreground/60 uppercase">{eyebrow}</p>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-balance sm:text-3xl">{title}</h2>
          <p className="max-w-xl text-sm leading-relaxed text-foreground/70">{description}</p>
          {action && <div className="pt-2">{action}</div>}
        </div>
        <div className="relative hidden h-32 w-40 shrink-0 sm:block lg:h-36 lg:w-52">
          <Image src={image} alt="" fill sizes="208px" className="object-contain mix-blend-multiply" />
        </div>
      </div>
    </section>
  );
}
