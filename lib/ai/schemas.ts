import { z } from "zod";

// ── 1. Business Classification ────────────────────────────────────────────
export const classificationSchema = z.object({
  refinedBusinessName: z.string().min(2).max(80),
  industry: z.string().min(2).max(80),
  businessType: z.enum([
    "service", "ecommerce", "retail", "manufacturing", "rental",
    "construction", "professional_services", "software", "marketplace",
    "subscription", "other",
  ]),
  serviceOfferings: z.array(z.string()).min(1).max(10),
  targetCustomer: z.string().min(10).max(400),
  competitiveLandscapeSummary: z.string().min(10).max(600),
  clarifyingQuestions: z.array(z.string()).max(5).default([]),
});
export type ClassificationOutput = z.infer<typeof classificationSchema>;

// ── 2. Startup Cost Estimator ─────────────────────────────────────────────
export const startupCostItemSchema = z.object({
  id: z.string(),
  category: z.enum([
    "Equipment", "Vehicle", "Trailer", "Tools", "Licenses", "Insurance",
    "Software", "Marketing", "Website", "Inventory", "Office", "Deposits",
    "Working Capital", "Miscellaneous",
  ]),
  description: z.string().min(2).max(120),
  quantity: z.number().int().min(1).max(100),
  costEach: z.number().min(0).max(500000),
  essential: z.boolean(),
});
export const startupCostsSchema = z.object({
  items: z.array(startupCostItemSchema).min(5).max(30),
});
export type StartupCostsOutput = z.infer<typeof startupCostsSchema>;

// ── 3. Pricing Generator (service packages) ───────────────────────────────
export const servicePackageSchema = z.object({
  id: z.string(),
  tier: z.enum(["starter", "core", "premium"]),
  name: z.string().min(2).max(60),
  description: z.string().min(10).max(300),
  includedServices: z.array(z.string()).min(1).max(10),
  customerPrice: z.number().min(0).max(1000000),
  estimatedLaborCost: z.number().min(0).max(1000000),
  materialCost: z.number().min(0).max(1000000),
});
export const pricingSchema = z.object({
  packages: z.array(servicePackageSchema).min(3).max(3),
});
export type PricingOutput = z.infer<typeof pricingSchema>;

// ── 4. Financial Assumptions (Revenue/Expense/Profit model inputs) ────────
// The AI proposes these numbers; lib/financial/* computes every downstream
// figure deterministically. See section 49 of the build spec.
export const financialAssumptionsSchema = z.object({
  averagePrice: z.number().min(1).max(1000000),
  startingCustomersPerMonth: z.number().min(1).max(100000),
  monthlyGrowthRatePct: z.number().min(0).max(50),
  repeatPurchasesPerYear: z.number().min(1).max(52),
  customerLifespanYears: z.number().min(1).max(20),
  directLaborPctOfRevenue: z.number().min(0).max(90),
  directMaterialsPctOfRevenue: z.number().min(0).max(90),
  otherDirectCostPerUnit: z.number().min(0).max(100000),
  employees: z.number().min(0).max(500),
  avgHourlyWage: z.number().min(0).max(300),
  laborHoursPerUnit: z.number().min(0).max(200),
  monthlyOverhead: z.number().min(0).max(1000000),
  monthlyMarketingSpend: z.number().min(0).max(1000000),
  customerAcquisitionCost: z.number().min(0).max(100000),
  closeRatePct: z.number().min(1).max(100),
  reasoning: z.string().min(10).max(800),
});
export type FinancialAssumptionsOutput = z.infer<typeof financialAssumptionsSchema>;

// ── 5. Business Scoring (qualitative sub-ratings only) ─────────────────────
export const qualitativeScoreSchema = z.object({
  scalability: z.number().int().min(0).max(100),
  scalabilityRationale: z.string().min(10).max(400),
  ownerFreedom: z.number().int().min(0).max(100),
  ownerFreedomRationale: z.string().min(10).max(400),
  risk: z.number().int().min(0).max(100),
  riskRationale: z.string().min(10).max(400),
  verdict: z.string().min(20).max(500),
});
export type QualitativeScoreOutput = z.infer<typeof qualitativeScoreSchema>;

// ── 6. Operations Plan ─────────────────────────────────────────────────────
export const operationsPlanSchema = z.object({
  dayToDayOperations: z.string().min(20).max(1500),
  staffingPlan: z.string().min(20).max(1000),
  equipmentNeeded: z.array(z.string()).min(1).max(20),
  suppliersAndVendors: z.array(z.string()).max(10).default([]),
  keyProcesses: z.array(z.string()).min(1).max(10),
});
export type OperationsPlanOutput = z.infer<typeof operationsPlanSchema>;

// ── 7. Marketing Plan ───────────────────────────────────────────────────────
export const marketingChannelSchema = z.object({
  channel: z.string(),
  difficulty: z.enum(["low", "medium", "high"]),
  expectedMonthlyCost: z.string(),
  timeToResults: z.string(),
  priority: z.enum(["low", "medium", "high"]),
});
export const marketingPlanSchema = z.object({
  channels: z.array(marketingChannelSchema).min(4).max(10),
  businessNameIdeas: z.array(z.string()).min(3).max(8),
  taglines: z.array(z.string()).min(3).max(6),
  uniqueSellingProposition: z.string().min(10).max(300),
  googleBusinessDescription: z.string().min(10).max(400),
  facebookBusinessDescription: z.string().min(10).max(400),
  instagramBio: z.string().min(5).max(160),
  socialPostIdeas: z.array(z.string()).min(6).max(12),
  adHeadlines: z.array(z.string()).min(3).max(6),
  adDescriptions: z.array(z.string()).min(3).max(6),
  websiteCopy: z.object({
    homeHeadline: z.string(),
    homeSubheadline: z.string(),
    aboutUs: z.string(),
    servicesIntro: z.string(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).min(3).max(8),
  }),
});
export type MarketingPlanOutput = z.infer<typeof marketingPlanSchema>;

// ── 8. Sales Kit ─────────────────────────────────────────────────────────
export const salesKitSchema = z.object({
  elevatorPitch: z.string().min(10).max(400),
  thirtySecondPitch: z.string().min(10).max(500),
  phoneScript: z.string().min(20).max(1200),
  coldEmail: z.string().min(20).max(1200),
  textMessage: z.string().min(5).max(300),
  followUpMessage: z.string().min(5).max(400),
  estimateFollowUp: z.string().min(5).max(400),
  referralRequest: z.string().min(5).max(400),
  upsellScript: z.string().min(5).max(400),
  objectionResponses: z.array(z.object({ objection: z.string(), response: z.string() })).min(3).max(8),
});
export type SalesKitOutput = z.infer<typeof salesKitSchema>;

// ── 9. Launch Plan (30-day) ────────────────────────────────────────────────
export const launchTaskSchema = z.object({
  week: z.number().int().min(1).max(4),
  task: z.string().min(3).max(200),
  priority: z.enum(["low", "medium", "high"]),
  estimatedTime: z.string(),
});
export const launchPlanSchema = z.object({
  tasks: z.array(launchTaskSchema).min(12).max(40),
});
export type LaunchPlanOutput = z.infer<typeof launchPlanSchema>;

// ── 10. Risk Analysis ──────────────────────────────────────────────────────
export const riskItemSchema = z.object({
  risk: z.string().min(5).max(200),
  probability: z.enum(["low", "medium", "high"]),
  impact: z.enum(["low", "medium", "high"]),
  mitigation: z.string().min(10).max(400),
});
export const riskAnalysisSchema = z.object({
  risks: z.array(riskItemSchema).min(3).max(8),
  bestCase: z.string().min(10).max(400),
  expectedCase: z.string().min(10).max(400),
  worstCase: z.string().min(10).max(400),
});
export type RiskAnalysisOutput = z.infer<typeof riskAnalysisSchema>;

// ── 11. Business Plan (narrative sections) ─────────────────────────────────
export const businessPlanSchema = z.object({
  executiveSummary: z.string().min(50).max(1200),
  businessConcept: z.string().min(30).max(800),
  targetCustomer: z.string().min(20).max(600),
  customerProblem: z.string().min(20).max(600),
  solution: z.string().min(20).max(600),
  competitiveAdvantage: z.string().min(20).max(600),
  pricingStrategy: z.string().min(20).max(600),
  revenueModel: z.string().min(20).max(600),
  salesStrategy: z.string().min(20).max(600),
  financialOutlook: z.string().min(20).max(800),
  growthStrategy: z.string().min(20).max(800),
  ownerObjectives: z.string().min(20).max(500),
});
export type BusinessPlanOutput = z.infer<typeof businessPlanSchema>;

// ── Chat advisor (streaming-free single response) ──────────────────────────
export const chatResponseSchema = z.object({
  answer: z.string().min(1).max(3000),
});
export type ChatResponseOutput = z.infer<typeof chatResponseSchema>;
