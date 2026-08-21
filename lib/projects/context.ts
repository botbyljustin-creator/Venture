import { buildContextSummary } from "@/lib/ai/context";
import type { ProjectBundle } from "@/lib/projects/data";

/** Renders a venture's full context (inputs + computed financials) for the AI chat advisor. */
export function buildProjectChatContext(bundle: ProjectBundle): string {
  const { inputs, score, forecast, startupCosts } = bundle;
  const parts: string[] = [];

  if (inputs) {
    parts.push(
      buildContextSummary({
        businessIdea: inputs.business_idea || "",
        location: inputs.location as unknown as Parameters<typeof buildContextSummary>[0]["location"],
        businessModel: inputs.business_model as unknown as Parameters<typeof buildContextSummary>[0]["businessModel"],
        ownerGoals: inputs.owner_goals as unknown as Parameters<typeof buildContextSummary>[0]["ownerGoals"],
        capital: inputs.capital as unknown as Parameters<typeof buildContextSummary>[0]["capital"],
        experience: inputs.experience as unknown as Parameters<typeof buildContextSummary>[0]["experience"],
        preferences: inputs.preferences as unknown as Parameters<typeof buildContextSummary>[0]["preferences"],
      })
    );
  }

  if (score) {
    parts.push(`\nVENTURE SCORE: ${score.overall}/100 (${score.label})\nVerdict: ${score.verdict}`);
  }

  if (startupCosts) {
    parts.push(`\nSTARTUP COSTS: total $${startupCosts.total.toLocaleString()}, minimum $${startupCosts.minimum.toLocaleString()}`);
  }

  if (forecast) {
    parts.push(`
FINANCIAL MODEL:
  Average price: $${forecast.unitEconomics.averagePrice}
  Gross margin: ${forecast.unitEconomics.grossMarginPct}%
  LTV:CAC: ${forecast.unitEconomics.ltvToCacRatio}
  Year 1 revenue: $${forecast.yearly[0]?.revenue.toLocaleString()}
  Year 1 operating profit: $${forecast.yearly[0]?.operatingProfit.toLocaleString()}
  Break-even: ${forecast.breakEven.estimatedMonthsUntilBreakEven ? `month ${forecast.breakEven.estimatedMonthsUntilBreakEven}` : "not reached in year 1"}
  Break-even customers/month: ${forecast.breakEven.breakEvenCustomersPerMonth}`);
  }

  return parts.join("\n");
}
