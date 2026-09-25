import { SITE_CONTACT } from "@/lib/site-config";
import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

const POLICY_LINKS = [
  { href: "/refund-policy", label: "Refund Policy" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export function SiteFooter() {
  return (
    <footer className="grain bg-silk text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2.5 font-serif text-lg font-bold">
            <Image src="/twlogo.jpeg" alt="TWPHYSICS" width={36} height={36} className="size-9 rounded-full" />
            TWPHYSICS
          </p>
          <p className="mt-2 text-sm text-background/70">
            NEET &amp; IIT-Mains preparation, made accessible to everyone.
          </p>
        </div>

        <div className="space-y-2 text-sm text-background/70">
          <p className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0" /> {SITE_CONTACT.location}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="size-4 shrink-0" />
            <a href={SITE_CONTACT.phoneHref} className="hover:text-background">{SITE_CONTACT.phoneDisplay}</a>
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-4 shrink-0" />
            <a href={`mailto:${SITE_CONTACT.email}`} className="hover:text-background">{SITE_CONTACT.email}</a>
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Link href="/apply" className="text-background/70 hover:text-background">
            Apply to Teach
          </Link>
          {POLICY_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-background/70 hover:text-background"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-background/10 py-4 text-center text-xs text-background/50">
        &copy; {new Date().getFullYear()} TWPHYSICS. All rights reserved.
      </div>
    </footer>
  );
}
