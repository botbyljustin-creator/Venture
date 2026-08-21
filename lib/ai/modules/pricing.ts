import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { pricingSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateServicePricing(inputs: ProjectInputs, classification: ClassificationOutput) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_pricing",
    schema: pricingSchema,
    prompt: `Design a 3-tier pricing structure (Starter, Core, Premium) for this business.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Offerings: ${classification.serviceOfferings.join(", ")}

For each of the 3 tiers, give a name, description, 2-6 included services, and realistic
customerPrice, estimatedLaborCost, and materialCost for this location and market. Prices
should increase meaningfully tier to tier and reflect real market rates for ${classification.industry}
in ${inputs.location.city}, ${inputs.location.region}.`,
  });
}
