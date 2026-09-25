import type { Metadata } from "next";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsappButton } from "@/components/marketing/whatsapp-button";
import { TestimonialsGrid } from "@/components/marketing/testimonials";
import { CtaButton } from "@/components/ui/cta-button";

export const metadata: Metadata = {
  title: "Testimonials — TWPHYSICS",
  description: "What TWPHYSICS students and parents say about our live classes, small batches and doubt support.",
};

export default function TestimonialsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="grain border-b bg-pink-band py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <span className="rounded-full border border-foreground/15 px-3.5 py-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Testimonials
            </span>
            <h1 className="mt-5 text-balance font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              What students and parents say
            </h1>
            <p className="mt-4 text-balance text-lg text-foreground/70">
              Honest words from the families preparing for NEET, JEE Main and EAPCET with us.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <TestimonialsGrid />
          </div>
        </section>

        <section className="border-t bg-tint-sky py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 text-center sm:px-6">
            <h2 className="text-balance font-heading text-3xl font-semibold tracking-tight">
              Ready to write your own story?
            </h2>
            <CtaButton href="/signup" size="lg">
              Register Now
            </CtaButton>
          </div>
        </section>
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  );
}
