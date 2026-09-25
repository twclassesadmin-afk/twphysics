"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/ui/cta-button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

// Section links are root-relative so they still work from other pages.
const NAV_LINKS = [
  { href: "/#courses", label: "Courses" },
  { href: "/#results", label: "Results" },
  { href: "/#batches", label: "Batches" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 md:bg-background/80 md:backdrop-blur-lg md:backdrop-saturate-150 md:supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-serif text-lg font-bold tracking-tight text-foreground">
          <Image src="/twlogo.jpeg" alt="TWPHYSICS" width={48} height={48} className="size-12 rounded-full" />
          TWPHYSICS
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button render={<Link href="/login" />} variant="ghost" size="sm">
            Student Login
          </Button>
          <CtaButton href="/signup" className="py-1.5 pl-4">
            Register Now
          </CtaButton>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="flex items-center gap-2.5 px-4 pt-4 font-serif text-lg font-bold">
              <Image src="/twlogo.jpeg" alt="TWPHYSICS" width={32} height={32} className="size-8 rounded-full" />
              TWPHYSICS
            </SheetTitle>
            <nav className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-sm font-medium text-foreground hover:bg-accent"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Button render={<Link href="/login" />} variant="outline">
                  Student Login
                </Button>
                <Button render={<Link href="/signup" />}>Register Now</Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
