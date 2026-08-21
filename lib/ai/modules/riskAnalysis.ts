import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { riskAnalysisSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateRiskAnalysis(inputs: ProjectInputs, classification: ClassificationOutput) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_risk_analysis",
    schema: riskAnalysisSchema,
    prompt: `Identify the top risks for this business and a best/expected/worst case narrative.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Competitive landscape: ${classification.competitiveLandscapeSummary}

Produce 3-8 top risks (each with probability, impact, and a concrete mitigation), plus a
short best case, expected case, and worst case scenario narrative.`,
  });
}
