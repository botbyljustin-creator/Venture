import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SampleResults } from "@/components/landing/sample-results";
import { Features } from "@/components/landing/features";
import { WhoItsFor } from "@/components/landing/who-its-for";
import { Industries } from "@/components/landing/industries";
import { PricingSection } from "@/components/landing/pricing-section";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { TrackOnMount } from "@/components/analytics/track-on-mount";

export default function HomePage() {
  return (
    <>
      <TrackOnMount event="landing_page_view" />
      <Hero />
      <HowItWorks />
      <SampleResults />
      <Features />
      <WhoItsFor />
      <Industries />
      <PricingSection />
      <Faq />
      <FinalCta />
    </>
  );
}
