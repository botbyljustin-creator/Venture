import type { FinancialAssumptions, ScenarioResult, ScenarioName } from "@/types/venture";
import { calculateMonthlyForecast, calculateYearlyForecast } from "./forecast";
import { calculateBreakEven } from "./breakeven";
import { round2 } from "./unitEconomics";

const SCENARIO_ADJUSTMENTS: Record<ScenarioName, (a: FinancialAssumptions) => FinancialAssumptions> = {
  conservative: (a) => ({
    ...a,
    averagePrice: round2(a.averagePrice * 0.9),
    startingCustomersPerMonth: Math.max(1, Math.round(a.startingCustomersPerMonth * 0.75)),
    monthlyGrowthRatePct: Math.max(0, a.monthlyGrowthRatePct - 3),
    directMaterialsPctOfRevenue: Math.min(90, a.directMaterialsPctOfRevenue + 2),
    monthlyMarketingSpend: round2(a.monthlyMarketingSpend * 0.8),
  }),
  expected: (a) => a,
  aggressive: (a) => ({
    ...a,
    averagePrice: round2(a.averagePrice * 1.1),
    startingCustomersPerMonth: Math.round(a.startingCustomersPerMonth * 1.25),
    monthlyGrowthRatePct: a.monthlyGrowthRatePct + 3,
    monthlyMarketingSpend: round2(a.monthlyMarketingSpend * 1.3),
  }),
};

export function calculateScenarios(base: FinancialAssumptions): Record<ScenarioName, ScenarioResult> {
  const names: ScenarioName[] = ["conservative", "expected", "aggressive"];
  const results = {} as Record<ScenarioName, ScenarioResult>;

  for (const name of names) {
    const assumptions = SCENARIO_ADJUSTMENTS[name](base);
    const monthly = calculateMonthlyForecast(assumptions);
    const yearly = calculateYearlyForecast(assumptions, monthly);
    const breakEven = calculateBreakEven(assumptions, monthly);

    results[name] = {
      name,
      assumptions,
      year1Revenue: yearly[0].revenue,
      year1Profit: yearly[0].operatingProfit,
      breakEvenMonth: breakEven.estimatedMonthsUntilBreakEven,
    };
  }

  return results;
}
