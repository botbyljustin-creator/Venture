import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput, PricingOutput } from "../schemas";
import { generateStructured } from "../generate";
import { salesKitSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateSalesKit(
  inputs: ProjectInputs,
  classification: ClassificationOutput,
  pricing: PricingOutput
) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_sales_kit",
    schema: salesKitSchema,
    maxTokens: 3000,
    prompt: `Write a sales kit for this business's front-line owner/salesperson.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Core package: ${pricing.packages.find((p) => p.tier === "core")?.name} at $${pricing.packages.find((p) => p.tier === "core")?.customerPrice}

Produce: an elevator pitch, a 30-second pitch, a phone script, a cold email, a text message,
a follow-up message, an estimate follow-up message, a referral request, an upsell script,
and 3-8 common objections with strong responses.`,
  });
}
