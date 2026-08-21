import type { FinancialAssumptions, UnitEconomics, BreakEvenResult, VentureScoreBreakdown } from "@/types/venture";

/**
 * The Venture Score. Three categories (profit potential, cash flow, startup
 * efficiency) are derived deterministically from the financial model.
 * Three more (scalability, owner freedom, risk) are inherently qualitative
 * business judgment calls, so they come in as AI-proposed 0-100 ratings
 * (validated range by Zod in lib/ai) — the AI never computes the *overall*
 * score, only proposes those three sub-ratings; the weighting math below is
 * deterministic and auditable.
 *
 * All six categories are scored 0-100 where HIGHER IS ALWAYS BETTER,
 * including "risk" (100 = very low risk).
 */
const WEIGHTS = {
  profitPotential: 0.2,
  cashFlow: 0.2,
  scalability: 0.2,
  ownerFreedom: 0.15,
  startupEfficiency: 0.1,
  risk: 0.15,
} as const;

export interface QualitativeScoreInputs {
  scalability: number; // 0-100, AI-proposed
  ownerFreedom: number; // 0-100, AI-proposed
  risk: number; // 0-100, AI-proposed (100 = very low risk)
}

export function deriveProfitPotentialScore(unit: UnitEconomics): number {
  return clampScore(bucket(unit.grossMarginPct, [
    [15, 20],
    [25, 40],
    [35, 60],
    [50, 80],
    [65, 95],
    [Infinity, 100],
  ]));
}

export function deriveCashFlowScore(a: FinancialAssumptions, breakEven: BreakEvenResult): number {
  const recurringScore = clampScore(a.repeatPurchasesPerYear <= 1 ? 40 : a.repeatPurchasesPerYear >= 6 ? 100 : 40 + a.repeatPurchasesPerYear * 10);
  const speedScore =
    breakEven.estimatedMonthsUntilBreakEven === null
      ? 20
      : clampScore(bucket(breakEven.estimatedMonthsUntilBreakEven, [
          [3, 100],
          [6, 85],
          [9, 65],
          [12, 45],
          [18, 25],
          [Infinity, 10],
        ]));
  return Math.round((recurringScore + speedScore) / 2);
}

export function deriveStartupEfficiencyScore(totalStartupCost: number): number {
  return clampScore(bucket(totalStartupCost, [
    [5000, 100],
    [10000, 85],
    [25000, 70],
    [50000, 55],
    [100000, 35],
    [Infinity, 15],
  ]));
}

export function calculateVentureScore(
  profitPotential: number,
  cashFlow: number,
  startupEfficiency: number,
  qualitative: QualitativeScoreInputs
): VentureScoreBreakdown {
  const categories = {
    profitPotential: clampScore(profitPotential),
    cashFlow: clampScore(cashFlow),
    scalability: clampScore(qualitative.scalability),
    ownerFreedom: clampScore(qualitative.ownerFreedom),
    startupEfficiency: clampScore(startupEfficiency),
    risk: clampScore(qualitative.risk),
  };

  const overall = Math.round(
    categories.profitPotential * WEIGHTS.profitPotential +
      categories.cashFlow * WEIGHTS.cashFlow +
      categories.scalability * WEIGHTS.scalability +
      categories.ownerFreedom * WEIGHTS.ownerFreedom +
      categories.startupEfficiency * WEIGHTS.startupEfficiency +
      categories.risk * WEIGHTS.risk
  );

  return { overall, label: scoreLabel(overall), categories };
}

export function scoreLabel(overall: number): string {
  if (overall >= 90) return "Exceptional Opportunity";
  if (overall >= 80) return "Excellent Opportunity";
  if (overall >= 70) return "Strong Opportunity";
  if (overall >= 60) return "Moderate Opportunity";
  if (overall >= 50) return "Challenging Opportunity";
  return "High Risk";
}

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Picks the score for the first bucket whose threshold the value is <=. */
function bucket(value: number, buckets: [threshold: number, score: number][]): number {
  for (const [threshold, score] of buckets) {
    if (value <= threshold) return score;
  }
  return buckets[buckets.length - 1][1];
}
