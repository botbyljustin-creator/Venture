import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { businessPlanSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateBusinessPlan(
  inputs: ProjectInputs,
  classification: ClassificationOutput,
  financialSummary: string
) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_business_plan",
    schema: businessPlanSchema,
    maxTokens: 4096,
    prompt: `Write a professional business plan narrative for this venture. Use the computed
financial figures given below as ground truth — do not invent different numbers.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Offerings: ${classification.serviceOfferings.join(", ")}
Target customer: ${classification.targetCustomer}

COMPUTED FINANCIALS (ground truth, cite these, do not recompute):
${financialSummary}

Write each section: executiveSummary, businessConcept, targetCustomer, customerProblem,
solution, competitiveAdvantage, pricingStrategy, revenueModel, salesStrategy,
financialOutlook, growthStrategy, ownerObjectives.`,
  });
}
