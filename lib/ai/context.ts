import type { ProjectInputs } from "@/types/venture";

const CAPITAL_LABELS: Record<string, string> = {
  under_5k: "Under $5,000",
  "5k_10k": "$5,000–$10,000",
  "10k_25k": "$10,000–$25,000",
  "25k_50k": "$25,000–$50,000",
  "50k_100k": "$50,000–$100,000",
  "100k_plus": "$100,000+",
};

const INVOLVEMENT_LABELS: Record<string, string> = {
  owner_operator: "Owner Operator",
  manage_small_team: "Manage a Small Team",
  manager_run: "Build a Manager-Run Company",
  mostly_passive: "Mostly Passive",
  sell_eventually: "Sell Eventually",
};

/**
 * Renders the wizard's inputs into a compact, consistent block that every
 * AI module prompt includes as context. Keeping this in one place means the
 * business context stays identical across all module calls and is cheap to
 * cache/reuse (see section 56, cost control).
 */
export function buildContextSummary(inputs: ProjectInputs): string {
  const capital = inputs.capital.customAmount
    ? `$${inputs.capital.customAmount.toLocaleString()}`
    : CAPITAL_LABELS[inputs.capital.band] ?? inputs.capital.band;

  return `
BUSINESS IDEA: ${inputs.businessIdea}

LOCATION: ${inputs.location.city}, ${inputs.location.region}, ${inputs.location.country}
  Service radius: ${inputs.location.serviceRadius || "not specified"}
  Business scope: ${inputs.location.scope}

BUSINESS MODEL:
  Industry: ${inputs.businessModel.industry}
  Business type: ${inputs.businessModel.businessType}

OWNER GOALS:
  Target annual owner income: $${inputs.ownerGoals.targetAnnualIncome.toLocaleString()}
  Target annual revenue: $${inputs.ownerGoals.targetAnnualRevenue.toLocaleString()}
  Desired weekly hours: ${inputs.ownerGoals.desiredWeeklyHours}
  Desired employees: ${inputs.ownerGoals.desiredEmployees}
  Desired involvement: ${INVOLVEMENT_LABELS[inputs.ownerGoals.involvement] ?? inputs.ownerGoals.involvement}

AVAILABLE STARTUP CAPITAL: ${capital}

EXPERIENCE:
  Industry experience: ${inputs.experience.industryExperience || "none stated"}
  Sales experience: ${inputs.experience.salesExperience || "none stated"}
  Management experience: ${inputs.experience.managementExperience || "none stated"}
  Existing equipment/resources: ${inputs.experience.existingEquipment || "none stated"}
  Existing customers/network: ${inputs.experience.existingNetwork || "none stated"}

PREFERENCES (1-5 importance, 5 = most important):
  Cash flow: ${inputs.preferences.cashFlow}
  Scalability: ${inputs.preferences.scalability}
  Flexibility: ${inputs.preferences.flexibility}
  Passive potential: ${inputs.preferences.passivePotential}
  Low startup cost: ${inputs.preferences.lowStartupCost}
  High profit margin: ${inputs.preferences.highProfitMargin}
  Recurring revenue: ${inputs.preferences.recurringRevenue}
  Exit potential: ${inputs.preferences.exitPotential}
`.trim();
}

export const BASE_SYSTEM_PROMPT = `You are VentureForge's business analysis engine — a senior business consultant, financial analyst, and startup advisor combined. You produce realistic, specific, actionable analysis for real small businesses, grounded in the user's stated location, capital, and goals. Avoid generic filler. Never invent unrealistic numbers — stay within ranges that are plausible for the stated industry and location. You always respond by calling the provided tool with structured data; you never respond with plain prose.`;
