import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { launchPlanSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateLaunchPlan(inputs: ProjectInputs, classification: ClassificationOutput) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_launch_plan",
    schema: launchPlanSchema,
    maxTokens: 3000,
    prompt: `Build a 30-day, week-by-week launch plan for this business.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})

Organize into Week 1 (Foundation), Week 2 (Build), Week 3 (Customer Acquisition), Week 4
(Launch). Produce 12-30 specific, actionable tasks total (3-10 per week), each with a
priority and a realistic estimated time.`,
  });
}
