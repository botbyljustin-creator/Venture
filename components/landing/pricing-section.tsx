import Link from "next/link";
import { Check } from "lucide-react";
import { plans } from "@/config/pricing";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Simple, Transparent Pricing</h2>
          <p className="mt-3 text-muted-foreground">Start free. Pay once, or go unlimited with Pro.</p>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-xl border bg-background p-6",
                plan.highlight ? "border-primary shadow-md ring-1 ring-primary" : "border-border"
              )}
            >
              {plan.highlight && (
                <span className="mb-3 inline-block w-fit rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                  Most Popular
                </span>
              )}
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-semibold">{plan.priceLabel}</span>
                {plan.interval !== "free" && plan.interval !== "one_time" && (
                  <span className="text-sm text-muted-foreground">/{plan.interval === "month" ? "mo" : "yr"}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={buttonVariants({ variant: plan.highlight ? "default" : "outline", className: "mt-6 w-full" })}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
