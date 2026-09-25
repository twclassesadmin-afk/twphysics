import Image from "next/image";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ApplyForm } from "./apply-form";

export default function ApplyPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-tint-lavender px-4 py-12">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-2">
          <div className="hidden lg:block">
            <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Teach with us</p>
            <h1 className="mt-3 text-balance font-serif text-4xl font-bold tracking-tight">
              Help students fall in love with Physics, Chemistry &amp; Maths
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Small batches, a structured syllabus and students who actually ask questions. Tell us
              about yourself and our team will get in touch.
            </p>
            <Image
              src="/illustrations/writing-desk.jpg"
              alt=""
              width={654}
              height={469}
              sizes="26rem"
              className="mt-8 h-auto w-[26rem] mix-blend-multiply"
            />
          </div>
          <div className="mx-auto w-full max-w-md">
            <ApplyForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
