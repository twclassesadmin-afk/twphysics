import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { faqs } from "@/lib/mock-data";

export function Faq() {
  return (
    <section id="faq" className="border-b py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading number={7} eyebrow="FAQ" title="Common questions" />
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[2fr_3fr]">
          <Reveal className="hidden lg:block">
            <Image
              src="/illustrations/book-stack-readers.jpg"
              alt="Students reading around a stack of books"
              width={1509}
              height={980}
              sizes="(min-width: 1024px) 26rem, 0px"
              className="h-auto w-full mix-blend-multiply"
            />
          </Reveal>
          <Reveal delay={0.1} className="mx-auto w-full max-w-3xl">
            <Accordion>
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <AccordionTrigger className="text-left text-base">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[15px] text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
