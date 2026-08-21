import { createAdminClient } from "@/lib/supabase/admin";
import { logAiUsage } from "@/lib/ai/usage";
import { sendAnalysisCompleteEmail } from "@/lib/email/send";
import {
  generateClassification,
  generateStartupCostItems,
  generateServicePricing,
  generateFinancialAssumptions,
  generateQualitativeScore,
  generateOperationsPlan,
  generateMarketingPlan,
  generateSalesKit,
  generateLaunchPlan,
  generateRiskAnalysis,
  generateBusinessPlan,
} from "@/lib/ai/modules";
import {
  calculateUnitEconomics,
  calculateMonthlyForecast,
  calculateYearlyForecast,
  calculateBreakEven,
  calculateScenarios,
  calculateGoalReverseEngineering,
  summarizeStartupCosts,
  calculateVentureScore,
  deriveProfitPotentialScore,
  deriveCashFlowScore,
  deriveStartupEfficiencyScore,
} from "@/lib/financial";
import type { FinancialAssumptions, ProjectInputs, StartupCostItem } from "@/types/venture";
import type { GenerationStatus, GenerationStepKey } from "./steps";

export class GenerationError extends Error {}

export async function runGenerationPipeline(projectId: string, userId: string): Promise<void> {
  const admin = createAdminClient();

  async function setStatus(currentStep: GenerationStatus["currentStep"], completedSteps: GenerationStepKey[]) {
    await admin
      .from("projects")
      .update({ generation_status: { currentStep, completedSteps } as unknown as never, status: "generating" })
      .eq("id", projectId);
  }

  async function fail(message: string) {
    await admin
      .from("projects")
      .update({ status: "error", generation_status: { currentStep: "done", completedSteps: [], error: message } as unknown as never })
      .eq("id", projectId);
  }

  try {
    const { data: project } = await admin.from("projects").select("*").eq("id", projectId).single();
    const { data: inputsRow } = await admin.from("project_inputs").select("*").eq("project_id", projectId).single();
    if (!project || !inputsRow) throw new GenerationError("Venture inputs not found");

    const inputs: ProjectInputs = {
      businessIdea: inputsRow.business_idea || "",
      location: inputsRow.location as unknown as ProjectInputs["location"],
      businessModel: inputsRow.business_model as unknown as ProjectInputs["businessModel"],
      ownerGoals: inputsRow.owner_goals as unknown as ProjectInputs["ownerGoals"],
      capital: inputsRow.capital as unknown as ProjectInputs["capital"],
      experience: inputsRow.experience as unknown as ProjectInputs["experience"],
      preferences: inputsRow.preferences as unknown as ProjectInputs["preferences"],
    };

    const completed: GenerationStepKey[] = [];
    const logUsage = (feature: string, r: { model: string; inputTokens: number; outputTokens: number; estimatedCostCents: number }) =>
      logAiUsage({ userId, projectId, feature, model: r.model, inputTokens: r.inputTokens, outputTokens: r.outputTokens, estimatedCostCents: r.estimatedCostCents });

    // ── Step 1: classification ────────────────────────────────────────
    await setStatus("classification", completed);
    const classificationResult = await generateClassification(inputs);
    await logUsage("classification", classificationResult);
    const classification = classificationResult.data;
    completed.push("classification");

    await admin.from("projects").update({
      name: classification.refinedBusinessName,
      industry: classification.industry,
      business_type: classification.businessType,
      country: inputs.location.country,
      region: inputs.location.region,
      city: inputs.location.city,
      service_radius: inputs.location.serviceRadius,
      business_scope: inputs.location.scope,
    }).eq("id", projectId);

    await admin.from("business_analyses").upsert(
      { project_id: projectId, module: "classification", version: 1, content: classification as unknown as never, model: classificationResult.model },
      { onConflict: "project_id,module,version" }
    );

    // ── Step 2 & 3: startup costs + pricing (parallel) ──────────────────
    await setStatus("startup_costs", completed);
    const [startupCostsResult, pricingResult] = await Promise.all([
      generateStartupCostItems(inputs, classification),
      generateServicePricing(inputs, classification),
    ]);
    await logUsage("startup_costs", startupCostsResult);
    await logUsage("pricing", pricingResult);
    completed.push("startup_costs");
    await setStatus("pricing", completed);
    completed.push("pricing");

    const items: StartupCostItem[] = startupCostsResult.data.items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    }));
    const startupSummary = summarizeStartupCosts(items);

    await admin.from("startup_costs").upsert(
      {
        project_id: projectId,
        items: startupSummary.items as unknown as never,
        total: startupSummary.totalStartupInvestment,
        minimum: startupSummary.minimumStartupInvestment,
        recommended: startupSummary.recommendedStartupCapital,
      },
      { onConflict: "project_id" }
    );

    const packages = pricingResult.data.packages.map((p) => ({ ...p, id: crypto.randomUUID() }));
    await admin.from("service_packages").upsert(
      { project_id: projectId, packages: packages as unknown as never },
      { onConflict: "project_id" }
    );

    // ── Step 4: financial model (assumptions + deterministic math) ─────
    await setStatus("financials", completed);
    const assumptionsResult = await generateFinancialAssumptions(inputs, classification);
    await logUsage("financial_assumptions", assumptionsResult);

    const { reasoning, ...assumptionValues } = assumptionsResult.data;
    void reasoning; // narrative only — not part of the deterministic assumptions object
    const assumptions: FinancialAssumptions = {
      ...assumptionValues,
      totalStartupCost: startupSummary.totalStartupInvestment,
      ownerAnnualIncomeGoal: inputs.ownerGoals.targetAnnualIncome,
    };

    const unitEconomics = calculateUnitEconomics(assumptions);
    const monthly = calculateMonthlyForecast(assumptions);
    const yearly = calculateYearlyForecast(assumptions, monthly);
    const breakEven = calculateBreakEven(assumptions, monthly);
    const scenarios = calculateScenarios(assumptions);
    const goalReverse = calculateGoalReverseEngineering(assumptions);

    await admin.from("financial_assumptions").upsert(
      { project_id: projectId, data: assumptions as unknown as never, version: 1 },
      { onConflict: "project_id" }
    );
    await admin.from("financial_forecasts").upsert(
      {
        project_id: projectId,
        unit_economics: unitEconomics as unknown as never,
        monthly: monthly as unknown as never,
        yearly: yearly as unknown as never,
        breakeven: breakEven as unknown as never,
        scenarios: scenarios as unknown as never,
        goal_reverse_engineering: goalReverse as unknown as never,
      },
      { onConflict: "project_id" }
    );
    completed.push("financials");

    // ── Step 5: venture score (deterministic + qualitative AI ratings) ─
    await setStatus("scoring", completed);
    const [qualitativeResult, riskResult] = await Promise.all([
      generateQualitativeScore(inputs, classification, unitEconomics, breakEven),
      generateRiskAnalysis(inputs, classification),
    ]);
    await logUsage("scoring", qualitativeResult);
    await logUsage("risk_analysis", riskResult);

    const profitPotential = deriveProfitPotentialScore(unitEconomics);
    const cashFlow = deriveCashFlowScore(assumptions, breakEven);
    const startupEfficiency = deriveStartupEfficiencyScore(assumptions.totalStartupCost);
    const score = calculateVentureScore(profitPotential, cashFlow, startupEfficiency, {
      scalability: qualitativeResult.data.scalability,
      ownerFreedom: qualitativeResult.data.ownerFreedom,
      risk: qualitativeResult.data.risk,
    });

    await admin.from("venture_scores").insert({
      project_id: projectId,
      overall: score.overall,
      label: score.label,
      verdict: qualitativeResult.data.verdict,
      profit_potential: score.categories.profitPotential,
      cash_flow: score.categories.cashFlow,
      scalability: score.categories.scalability,
      owner_freedom: score.categories.ownerFreedom,
      startup_efficiency: score.categories.startupEfficiency,
      risk: score.categories.risk,
      breakdown: qualitativeResult.data as unknown as never,
    });

    await admin.from("risk_analyses").upsert(
      {
        project_id: projectId,
        risks: riskResult.data.risks as unknown as never,
        best_case: { text: riskResult.data.bestCase } as unknown as never,
        expected_case: { text: riskResult.data.expectedCase } as unknown as never,
        worst_case: { text: riskResult.data.worstCase } as unknown as never,
      },
      { onConflict: "project_id" }
    );
    completed.push("scoring");

    // ── Step 6 & 7: marketing, sales, operations, launch plan (parallel) ─
    await setStatus("marketing", completed);
    const [marketingResult, salesResult, operationsResult, launchResult] = await Promise.all([
      generateMarketingPlan(inputs, classification),
      generateSalesKit(inputs, classification, pricingResult.data),
      generateOperationsPlan(inputs, classification),
      generateLaunchPlan(inputs, classification),
    ]);
    await logUsage("marketing_plan", marketingResult);
    await logUsage("sales_kit", salesResult);
    await logUsage("operations_plan", operationsResult);
    await logUsage("launch_plan", launchResult);
    completed.push("marketing");
    await setStatus("launch", completed);
    completed.push("launch");

    await admin.from("marketing_plans").upsert(
      {
        project_id: projectId,
        channels: marketingResult.data.channels as unknown as never,
        content: marketingResult.data as unknown as never,
        website_copy: marketingResult.data.websiteCopy as unknown as never,
      },
      { onConflict: "project_id" }
    );
    await admin.from("sales_kits").upsert(
      { project_id: projectId, content: salesResult.data as unknown as never },
      { onConflict: "project_id" }
    );
    await admin.from("business_analyses").upsert(
      { project_id: projectId, module: "operations_plan", version: 1, content: operationsResult.data as unknown as never, model: operationsResult.model },
      { onConflict: "project_id,module,version" }
    );

    await admin.from("launch_tasks").delete().eq("project_id", projectId);
    if (launchResult.data.tasks.length > 0) {
      await admin.from("launch_tasks").insert(
        launchResult.data.tasks.map((t, i) => ({
          project_id: projectId,
          week: t.week,
          task: t.task,
          priority: t.priority,
          estimated_time: t.estimatedTime,
          sort_order: i,
        }))
      );
    }

    // ── Step 8: business plan narrative + finalize ──────────────────────
    await setStatus("finalizing", completed);
    const financialSummary = `Venture Score: ${score.overall}/100 (${score.label})
Startup investment: $${startupSummary.totalStartupInvestment.toLocaleString()}
Year 1 revenue: $${yearly[0].revenue.toLocaleString()}, Year 1 operating profit: $${yearly[0].operatingProfit.toLocaleString()}
Break-even: ~${breakEven.estimatedMonthsUntilBreakEven ?? "not reached in year 1"} months, ${breakEven.breakEvenCustomersPerMonth} customers/month
Unit economics: avg price $${unitEconomics.averagePrice}, gross margin ${unitEconomics.grossMarginPct}%, LTV:CAC ${unitEconomics.ltvToCacRatio}`;

    const businessPlanResult = await generateBusinessPlan(inputs, classification, financialSummary);
    await logUsage("business_plan", businessPlanResult);

    await admin.from("business_analyses").upsert(
      { project_id: projectId, module: "business_plan", version: 1, content: businessPlanResult.data as unknown as never, model: businessPlanResult.model },
      { onConflict: "project_id,module,version" }
    );

    await admin
      .from("projects")
      .update({
        status: "ready",
        generation_status: { currentStep: "done", completedSteps: [...completed, "finalizing"] } as unknown as never,
        venture_score: score.overall,
        startup_cost: startupSummary.totalStartupInvestment,
        year1_revenue: yearly[0].revenue,
        year1_profit: yearly[0].operatingProfit,
        breakeven_month: breakEven.estimatedMonthsUntilBreakEven,
      })
      .eq("id", projectId);

    const { data: profile } = await admin.from("profiles").select("email").eq("id", userId).single();
    if (profile?.email) {
      await sendAnalysisCompleteEmail(profile.email, classification.refinedBusinessName, projectId, score.overall);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed unexpectedly";
    await fail(message);
    throw err;
  }
}
