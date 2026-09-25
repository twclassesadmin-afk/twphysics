import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { SubjectsOrbit } from "@/components/marketing/subjects-orbit";
import { OurApproach } from "@/components/marketing/our-approach";
import { StudyApproachScroll } from "@/components/marketing/study-approach-scroll";
import { CourseCards } from "@/components/marketing/course-cards";
import { PricingTiers } from "@/components/marketing/pricing-tiers";
import { ResultsWall } from "@/components/marketing/results-wall";
import { BatchShowcase } from "@/components/marketing/batch-showcase";
import { DoubtSupportBand } from "@/components/marketing/doubt-support-band";
import { Faq } from "@/components/marketing/faq";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsappButton } from "@/components/marketing/whatsapp-button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        {/* Laptop+: one pinned, scroll-driven section. Smaller screens: two static sections. */}
        <StudyApproachScroll className="hidden lg:block" />
        <div className="lg:hidden">
          <SubjectsOrbit />
          <OurApproach />
        </div>
        <CourseCards />
        <PricingTiers />
        <ResultsWall />
        <BatchShowcase />
        <DoubtSupportBand />
        <Faq />
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  );
}
