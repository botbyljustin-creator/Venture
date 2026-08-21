import type { ProjectInputs } from "@/types/venture";
import type { ClassificationOutput } from "../schemas";
import { generateStructured } from "../generate";
import { marketingPlanSchema } from "../schemas";
import { buildContextSummary, BASE_SYSTEM_PROMPT } from "../context";
import { AI_MODELS } from "../models";

export async function generateMarketingPlan(inputs: ProjectInputs, classification: ClassificationOutput) {
  return generateStructured({
    model: AI_MODELS.analysis,
    system: BASE_SYSTEM_PROMPT,
    toolName: "emit_marketing_plan",
    schema: marketingPlanSchema,
    maxTokens: 4096,
    prompt: `Build a customer acquisition + marketing kit for this business.

${buildContextSummary(inputs)}

Business: ${classification.refinedBusinessName} (${classification.industry})
Target customer: ${classification.targetCustomer}

Produce: 4-8 recommended acquisition channels (pick from Google Business Profile, Google Ads,
Facebook Ads, Instagram, SEO, Direct Mail, Door Hangers, Cold Calling, Email Outreach,
Referral Partnerships, Contractor Partnerships, Property Managers, Realtors, Local
Networking, Marketplace Platforms — only ones that fit) each with difficulty/cost/time/
priority; business name ideas; taglines; a unique selling proposition; Google/Facebook
business descriptions; an Instagram bio; 6-12 social post ideas; 3-6 ad headlines and
descriptions; and website copy (home headline/subheadline, about us, services intro, FAQ).`,
  });
}
