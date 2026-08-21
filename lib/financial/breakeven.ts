import type { FinancialAssumptions, BreakEvenResult, MonthlyForecastRow } from "@/types/venture";
import { calculateUnitEconomics, round2 } from "./unitEconomics";

export function calculateBreakEven(
  a: FinancialAssumptions,
  monthly: MonthlyForecastRow[]
): BreakEvenResult {
  const unit = calculateUnitEconomics(a);
  const fixedMonthlyExpenses =
    a.monthlyOverhead + a.monthlyMarketingSpend + a.employees * a.avgHourlyWage * 160;

  const contributionMarginPerCustomer = a.averagePrice - unit.directLaborCost - unit.directMaterialsCost - unit.otherDirectCost;

  const breakEvenCustomersPerMonth =
    contributionMarginPerCustomer > 0
      ? Math.ceil(fixedMonthlyExpenses / contributionMarginPerCustomer)
      : Infinity;

  const breakEvenRevenuePerMonth =
    Number.isFinite(breakEvenCustomersPerMonth) ? breakEvenCustomersPerMonth * a.averagePrice : Infinity;

  const monthIndex = monthly.findIndex((m) => m.ebitda >= 0);

  return {
    fixedMonthlyExpenses: round2(fixedMonthlyExpenses),
    contributionMarginPerCustomer: round2(contributionMarginPerCustomer),
    breakEvenCustomersPerMonth: Number.isFinite(breakEvenCustomersPerMonth) ? breakEvenCustomersPerMonth : 0,
    breakEvenRevenuePerMonth: Number.isFinite(breakEvenRevenuePerMonth) ? round2(breakEvenRevenuePerMonth) : 0,
    estimatedMonthsUntilBreakEven: monthIndex === -1 ? null : monthIndex + 1,
  };
}
