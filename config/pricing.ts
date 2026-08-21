/**
 * Pricing configuration. Update these values (and the matching Stripe Price IDs
 * in your environment variables) to change plans without touching business logic.
 */
export type PlanId = "free" | "launch" | "pro" | "pro_annual";

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  priceLabel: string;
  priceCents: number;
  interval: "one_time" | "month" | "year" | "free";
  stripePriceEnvVar?: string;
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
}

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "$0",
    priceCents: 0,
    interval: "free",
    description: "Try VentureForge with one limited venture analysis.",
    features: ["1 Venture Score", "Limited analysis", "No exports"],
    cta: "Start Free",
  },
  {
    id: "launch",
    name: "Launch",
    priceLabel: "$49",
    priceCents: 4900,
    interval: "one_time",
    stripePriceEnvVar: "STRIPE_LAUNCH_PRICE_ID",
    description: "Everything you need to fully evaluate and launch one venture.",
    features: [
      "Full Business Analysis",
      "Financial Model",
      "Pricing Strategy",
      "Launch Plan",
      "PDF Export",
    ],
    cta: "Unlock Full Report",
    highlight: true,
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "$19",
    priceCents: 1900,
    interval: "month",
    stripePriceEnvVar: "STRIPE_PRO_MONTHLY_PRICE_ID",
    description: "For serious entrepreneurs evaluating multiple ventures.",
    features: [
      "Unlimited saved ventures",
      "AI Venture Advisor",
      "Scenario Modeling",
      "PDF Export",
      "Excel Export",
      "Editable Financial Models",
      "Marketing Kit",
      "Sales Kit",
    ],
    cta: "Start Pro",
  },
  {
    id: "pro_annual",
    name: "Pro Annual",
    priceLabel: "$199",
    priceCents: 19900,
    interval: "year",
    stripePriceEnvVar: "STRIPE_PRO_ANNUAL_PRICE_ID",
    description: "All Pro features billed annually — save over 2 months.",
    features: [
      "Everything in Pro",
      "Best value for ongoing use",
    ],
    cta: "Start Pro Annual",
  },
];

export function getPlan(id: PlanId): Plan {
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan id: ${id}`);
  return plan;
}

/** Entitlement helpers describing what each plan unlocks. */
export const entitlements = {
  free: {
    maxVentures: 1,
    fullAnalysis: false,
    exportsEnabled: false,
    aiAdvisor: false,
    scenarioModeling: false,
  },
  launch: {
    // "launch" is a one-time purchase scoped to the specific project purchased.
    maxVentures: 1,
    fullAnalysis: true,
    exportsEnabled: true,
    aiAdvisor: true,
    scenarioModeling: true,
  },
  pro: {
    maxVentures: Infinity,
    fullAnalysis: true,
    exportsEnabled: true,
    aiAdvisor: true,
    scenarioModeling: true,
  },
  pro_annual: {
    maxVentures: Infinity,
    fullAnalysis: true,
    exportsEnabled: true,
    aiAdvisor: true,
    scenarioModeling: true,
  },
} as const satisfies Record<PlanId, Record<string, unknown>>;
