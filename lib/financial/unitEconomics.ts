import type { FinancialAssumptions, UnitEconomics } from "@/types/venture";

/**
 * All financial math lives here and in the sibling modules — never in an AI
 * prompt. The AI proposes assumptions (average price, close rate, growth
 * rate, etc.); this file turns assumptions into numbers deterministically
 * so results are reproducible and auditable.
 */
export function calculateUnitEconomics(a: FinancialAssumptions): UnitEconomics {
  const directLaborCost = a.averagePrice * (a.directLaborPctOfRevenue / 100);
  const directMaterialsCost = a.averagePrice * (a.directMaterialsPctOfRevenue / 100);
  const otherDirectCost = a.otherDirectCostPerUnit;

  const grossProfit = a.averagePrice - directLaborCost - directMaterialsCost - otherDirectCost;
  const grossMarginPct = a.averagePrice > 0 ? (grossProfit / a.averagePrice) * 100 : 0;

  const contributionMargin = grossProfit - a.customerAcquisitionCost;

  const estimatedLTV =
    a.averagePrice *
    Math.max(a.repeatPurchasesPerYear, 1) *
    Math.max(a.customerLifespanYears, 1) *
    (grossMarginPct / 100);

  const ltvToCacRatio = a.customerAcquisitionCost > 0 ? estimatedLTV / a.customerAcquisitionCost : 0;

  const monthlyFixedCosts = a.monthlyOverhead + a.monthlyMarketingSpend;
  const breakEvenCustomers = contributionMargin > 0 ? Math.ceil(monthlyFixedCosts / contributionMargin) : Infinity;

  return {
    averagePrice: round2(a.averagePrice),
    directLaborCost: round2(directLaborCost),
    directMaterialsCost: round2(directMaterialsCost),
    otherDirectCost: round2(otherDirectCost),
    grossProfit: round2(grossProfit),
    grossMarginPct: round2(grossMarginPct),
    customerAcquisitionCost: round2(a.customerAcquisitionCost),
    contributionMargin: round2(contributionMargin),
    estimatedLTV: round2(estimatedLTV),
    ltvToCacRatio: round2(ltvToCacRatio),
    breakEvenCustomers: Number.isFinite(breakEvenCustomers) ? breakEvenCustomers : 0,
  };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
