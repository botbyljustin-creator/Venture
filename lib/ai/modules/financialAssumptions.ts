import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { financialAssumptionsSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

/**
 * The AI proposes assumption VALUES only (average price, growth rate, cost
 * percentages, overhead, etc). It never computes revenue, profit, or
 * break-even — lib/financial/* does that deterministically from these
 * assumptions. See build spec section 49.
 */
export async function generateFinancialAssumptions(inputs: ProjectInputs, classification: ClassificationOutput) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_financial_assumptions",
    schema: financialAssumptionsSchema,
    prompt: `Propose realistic financial model ASSUMPTIONS for this business. Do not compute
revenue, profit, or totals yourself — only propose the input assumptions below. Downstream
code will perform all arithmetic.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Offerings: ${classification.serviceOfferings.join(", ")}

Propose: averagePrice (typical transaction/job value), startingCustomersPerMonth (realistic
month-1 volume for a brand new business here), monthlyGrowthRatePct, repeatPurchasesPerYear,
customerLifespanYears, directLaborPctOfRevenue, directMaterialsPctOfRevenue,
otherDirectCostPerUnit, employees (headcount excluding owner), avgHourlyWage,
laborHoursPerUnit, monthlyOverhead, monthlyMarketingSpend, customerAcquisitionCost,
closeRatePct (lead-to-customer conversion). Include a short "reasoning" string explaining
how these numbers were chosen for this specific location and industry.`,
  });
}
