"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import {
  calculateUnitEconomics,
  calculateMonthlyForecast,
  calculateYearlyForecast,
  calculateBreakEven,
  calculateScenarios,
  calculateGoalReverseEngineering,
  calculateVentureScore,
  deriveProfitPotentialScore,
  deriveCashFlowScore,
  deriveStartupEfficiencyScore,
} from "@/lib/financial";
import type { FinancialAssumptions } from "@/types/venture";

export interface SaveAssumptionsResult {
  error?: string;
  success?: boolean;
}

/**
 * Persists user-edited assumptions and recomputes every downstream figure
 * deterministically — the same math the generation pipeline uses, just
 * re-run with the user's overrides instead of the AI's proposed values.
 */
export async function saveAssumptionsAction(projectId: string, assumptions: FinancialAssumptions): Promise<SaveAssumptionsResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("user_id").eq("id", projectId).single();
  if (!project || project.user_id !== user.id) return { error: "Venture not found" };

  const unitEconomics = calculateUnitEconomics(assumptions);
  const monthly = calculateMonthlyForecast(assumptions);
  const yearly = calculateYearlyForecast(assumptions, monthly);
  const breakEven = calculateBreakEven(assumptions, monthly);
  const scenarios = calculateScenarios(assumptions);
  const goalReverse = calculateGoalReverseEngineering(assumptions);

  await supabase
    .from("financial_assumptions")
    .update({ data: assumptions as unknown as never })
    .eq("project_id", projectId);

  await supabase
    .from("financial_forecasts")
    .update({
      unit_economics: unitEconomics as unknown as never,
      monthly: monthly as unknown as never,
      yearly: yearly as unknown as never,
      breakeven: breakEven as unknown as never,
      scenarios: scenarios as unknown as never,
      goal_reverse_engineering: goalReverse as unknown as never,
    })
    .eq("project_id", projectId);

  await supabase
    .from("projects")
    .update({
      startup_cost: assumptions.totalStartupCost,
      year1_revenue: yearly[0].revenue,
      year1_profit: yearly[0].operatingProfit,
      breakeven_month: breakEven.estimatedMonthsUntilBreakEven,
    })
    .eq("id", projectId);

  // Recompute the score's deterministic categories, reusing the last
  // AI-proposed qualitative ratings (scalability/ownerFreedom/risk) since
  // editing financial assumptions doesn't change those business-judgment
  // dimensions.
  const { data: lastScore } = await supabase
    .from("venture_scores")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastScore) {
    const profitPotential = deriveProfitPotentialScore(unitEconomics);
    const cashFlow = deriveCashFlowScore(assumptions, breakEven);
    const startupEfficiency = deriveStartupEfficiencyScore(assumptions.totalStartupCost);
    const score = calculateVentureScore(profitPotential, cashFlow, startupEfficiency, {
      scalability: lastScore.scalability,
      ownerFreedom: lastScore.owner_freedom,
      risk: lastScore.risk,
    });

    await supabase.from("venture_scores").insert({
      project_id: projectId,
      overall: score.overall,
      label: score.label,
      verdict: lastScore.verdict,
      profit_potential: score.categories.profitPotential,
      cash_flow: score.categories.cashFlow,
      scalability: score.categories.scalability,
      owner_freedom: score.categories.ownerFreedom,
      startup_efficiency: score.categories.startupEfficiency,
      risk: score.categories.risk,
      breakdown: lastScore.breakdown,
    });

    await supabase.from("projects").update({ venture_score: score.overall }).eq("id", projectId);
  }

  revalidatePath(`/ventures/${projectId}/financials`);
  revalidatePath(`/ventures/${projectId}`);
  return { success: true };
}
