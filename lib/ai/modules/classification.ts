import type { ProjectInputs } from "@/types/venture";
import { generateStructured } from "../generate";
import { classificationSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateClassification(inputs: ProjectInputs) {
  return generateStructured({
    model: AI_MODELS.classification,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_classification",
    schema: classificationSchema,
    prompt: `Classify and refine this business idea into a structured profile.

${buildContextSummary(inputs)}

Produce:
- A clean, professional business name (refinedBusinessName)
- The correct industry and businessType
- 3-8 specific service/product offerings this business should provide
- A one-paragraph target customer description
- A short competitive landscape summary for this location
- Up to 5 clarifying questions that would materially improve the analysis (empty array if none needed)`,
  });
}
