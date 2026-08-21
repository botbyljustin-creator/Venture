import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { startupCostsSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateStartupCostItems(inputs: ProjectInputs, classification: ClassificationOutput) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_startup_costs",
    schema: startupCostsSchema,
    maxTokens: 3000,
    prompt: `Generate a realistic startup cost checklist for this business.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Offerings: ${classification.serviceOfferings.join(", ")}

List 8-20 specific line items across categories (Equipment, Vehicle, Trailer, Tools, Licenses,
Insurance, Software, Marketing, Website, Inventory, Office, Deposits, Working Capital,
Miscellaneous — only include categories that are relevant). For each item give a realistic
quantity and cost-each for this location, and mark it essential:true only if the business
literally cannot operate/launch without it; otherwise essential:false. Keep total costs
plausible for the user's stated available capital band.`,
  });
}
