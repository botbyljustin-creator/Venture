import type { FinancialAssumptions, GoalReverseEngineeringResult } from "@/types/venture";
import { calculateUnitEconomics } from "./unitEconomics";

/**
 * Powers both "What Would Have To Be True?" (section 26) and the Goal
 * Reverse Engineering funnel (section 27): given a target owner income,
 * work backward to required revenue, units, and leads.
 */
export function calculateGoalReverseEngineering(
  a: FinancialAssumptions,
  targetAnnualIncome: number = a.ownerAnnualIncomeGoal ?? 0
): GoalReverseEngineeringResult {
  const unit = calculateUnitEconomics(a);
  const grossProfitPerUnit = a.averagePrice - unit.directLaborCost - unit.directMaterialsCost - unit.otherDirectCost;

  const annualFixedCosts =
    (a.monthlyOverhead + a.monthlyMarketingSpend + a.employees * a.avgHourlyWage * 160) * 12;

  const requiredAnnualProfit = targetAnnualIncome;
  const requiredAnnualRevenueTarget = annualFixedCosts + requiredAnnualProfit;

  const requiredUnitsPerYear =
    grossProfitPerUnit > 0 ? Math.ceil(requiredAnnualRevenueTarget / grossProfitPerUnit) : 0;

  const requiredAnnualRevenue = round(requiredUnitsPerYear * a.averagePrice);
  const requiredUnitsPerMonth = Math.ceil(requiredUnitsPerYear / 12);
  const requiredUnitsPerWeek = Math.ceil(requiredUnitsPerMonth / 4.33);
  const requiredLeadsPerWeek =
    a.closeRatePct > 0 ? Math.ceil(requiredUnitsPerWeek / (a.closeRatePct / 100)) : requiredUnitsPerWeek;

  return {
    targetAnnualIncome,
    requiredAnnualProfit: round(requiredAnnualProfit),
    requiredAnnualRevenue,
    requiredUnitsPerYear,
    requiredUnitsPerMonth,
    requiredUnitsPerWeek,
    requiredLeadsPerWeek,
    assumedCloseRatePct: a.closeRatePct,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
