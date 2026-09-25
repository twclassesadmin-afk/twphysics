import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsappButton } from "@/components/marketing/whatsapp-button";
import { TestimonialsGrid } from "@/components/marketing/testimonials";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: "Testimonials — TWPHYSICS",
  description:
    "What TWPHYSICS students and parents say about our live classes, small batches and doubt support.",
};

export default function TestimonialsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="grain border-b bg-pink-band py-16 sm:py-20">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 sm:px-6 lg:flex-row lg:justify-between">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="rounded-full border border-foreground/15 px-3.5 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Testimonials
              </span>
              <h1 className="mt-5 text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl">
                What students and parents say
              </h1>
              <p className="mt-4 text-balance text-lg text-foreground/70">
                Honest words from the families preparing for NEET, JEE Main and
                EAPCET with us.
              </p>
            </div>
            <Image
              src="/illustrations/flying-books.jpg"
              alt="A student joyfully surrounded by open books"
              width={612}
              height={408}
              priority
              sizes="(min-width: 1024px) 24rem, 0px"
              className="hidden h-auto w-96 shrink-0 rounded-3xl shadow-xl shadow-foreground/10 lg:block"
            />
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <TestimonialsGrid />
          </div>
        </section>

        <section className="border-t bg-tint-sky py-16">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-4 text-center sm:px-6 md:flex-row md:justify-center md:text-left">
            <Image
              src="/illustrations/reading-together.jpg"
              alt=""
              width={612}
              height={419}
              sizes="16rem"
              className="h-auto w-56 shrink-0 mix-blend-multiply sm:w-64"
            />
            <div className="flex flex-col items-center gap-5 md:items-start">
              <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight">
                Ready to write your own story?
              </h2>
              <CtaButton href="/signup" size="lg">
                Register Now
              </CtaButton>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  );
}
