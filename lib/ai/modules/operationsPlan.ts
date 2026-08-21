import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { operationsPlanSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateOperationsPlan(inputs: ProjectInputs, classification: ClassificationOutput) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_operations_plan",
    schema: operationsPlanSchema,
    prompt: `Write an operations plan for this business.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Offerings: ${classification.serviceOfferings.join(", ")}

Cover: day-to-day operations, a staffing plan matching the owner's desired involvement and
employee count, a list of equipment needed to actually deliver the offerings, likely
suppliers/vendors, and the key operational processes that need to be built.`,
  });
}
