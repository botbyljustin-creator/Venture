import { PricingSection } from "@/components/landing/pricing-section";
import { Faq } from "@/components/landing/faq";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <>
      <div className="mx-auto max-w-2xl px-6 pt-20 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="mt-3 text-muted-foreground">Choose the plan that fits how many ventures you want to evaluate.</p>
      </div>
      <PricingSection />
      <Faq />
    </>
  );
}
