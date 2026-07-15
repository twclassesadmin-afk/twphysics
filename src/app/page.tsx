import { SiteHeader } from "@/components/marketing/site-header";
import { Hero } from "@/components/marketing/hero";
import { StatsBar } from "@/components/marketing/stats-bar";
import { OurApproach } from "@/components/marketing/our-approach";
import { CourseCards } from "@/components/marketing/course-cards";
import { FreeResources } from "@/components/marketing/free-resources";
import { ResultsWall } from "@/components/marketing/results-wall";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Testimonials } from "@/components/marketing/testimonials";
import { BatchShowcase } from "@/components/marketing/batch-showcase";
import { Faq } from "@/components/marketing/faq";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WhatsappButton } from "@/components/marketing/whatsapp-button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <OurApproach />
        <CourseCards />
        <FreeResources />
        <ResultsWall />
        <HowItWorks />
        <Testimonials />
        <BatchShowcase />
        <Faq />
      </main>
      <SiteFooter />
      <WhatsappButton />
    </div>
  );
}
