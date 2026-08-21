import type { ProjectInputs, UnitEconomics, BreakEvenResult } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { qualitativeScoreSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

/**
 * Produces only the three qualitative Venture Score sub-ratings
 * (scalability, ownerFreedom, risk) plus a verdict. The two quantitative
 * categories (profit potential, cash flow) and the overall weighted score
 * are computed deterministically in lib/financial/score.ts.
 */
export async function generateQualitativeScore(
  inputs: ProjectInputs,
  classification: ClassificationOutput,
  unit: UnitEconomics,
  breakEven: BreakEvenResult
) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_qualitative_score",
    schema: qualitativeScoreSchema,
    prompt: `Rate this business opportunity on three qualitative dimensions, each 0-100 where
HIGHER IS ALWAYS BETTER (for risk, 100 = very low risk).

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Computed unit economics: gross margin ${unit.grossMarginPct}%, LTV:CAC ${unit.ltvToCacRatio}
Computed break-even: ~${breakEven.breakEvenCustomersPerMonth} customers/month, fixed costs $${breakEven.fixedMonthlyExpenses}/mo

Rate:
- scalability (0-100): ability to hire, repeat, expand geographically, automate, franchise
- ownerFreedom (0-100): low owner dependence, scheduling flexibility, ability to delegate
- risk (0-100, higher = SAFER): competition, regulation, seasonality, economic sensitivity, customer concentration

Also write a 1-2 sentence verdict summarizing whether this is a strong opportunity and what
has to be true for it to work (e.g. "Strong opportunity if the company can consistently
acquire X qualified jobs per week while maintaining an average ticket above $Y.").`,
  });
}
