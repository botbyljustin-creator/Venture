import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  FinancialAssumptions,
  UnitEconomics,
  MonthlyForecastRow,
  YearlyForecastRow,
  BreakEvenResult,
  ScenarioName,
  ScenarioResult,
  GoalReverseEngineeringResult,
  StartupCostItem,
  ServicePackage,
} from "@/types/venture";
import type { ClassificationOutput, BusinessPlanOutput, OperationsPlanOutput, MarketingPlanOutput, SalesKitOutput, RiskAnalysisOutput } from "@/lib/ai/schemas";

/**
 * Loads every piece of a venture in one pass. Wrapped in React's `cache()`
 * so the layout and each nested page can call this with the same id and
 * only hit the database once per request.
 */
export const getProjectBundle = cache(async (projectId: string) => {
  const supabase = await createClient();

  const [
    projectRes,
    inputsRes,
    scoreRes,
    assumptionsRes,
    forecastRes,
    startupCostsRes,
    packagesRes,
    marketingRes,
    salesRes,
    launchTasksRes,
    riskRes,
    classificationRes,
    operationsRes,
    businessPlanRes,
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).single(),
    supabase.from("project_inputs").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("venture_scores").select("*").eq("project_id", projectId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("financial_assumptions").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("financial_forecasts").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("startup_costs").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("service_packages").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("marketing_plans").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("sales_kits").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("launch_tasks").select("*").eq("project_id", projectId).order("sort_order"),
    supabase.from("risk_analyses").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("business_analyses").select("*").eq("project_id", projectId).eq("module", "classification").maybeSingle(),
    supabase.from("business_analyses").select("*").eq("project_id", projectId).eq("module", "operations_plan").maybeSingle(),
    supabase.from("business_analyses").select("*").eq("project_id", projectId).eq("module", "business_plan").maybeSingle(),
  ]);

  if (!projectRes.data) notFound();

  return {
    project: projectRes.data,
    inputs: inputsRes.data,
    score: scoreRes.data,
    assumptions: assumptionsRes.data?.data as unknown as FinancialAssumptions | undefined,
    forecast: forecastRes.data
      ? {
          unitEconomics: forecastRes.data.unit_economics as unknown as UnitEconomics,
          monthly: forecastRes.data.monthly as unknown as MonthlyForecastRow[],
          yearly: forecastRes.data.yearly as unknown as YearlyForecastRow[],
          breakEven: forecastRes.data.breakeven as unknown as BreakEvenResult,
          scenarios: forecastRes.data.scenarios as unknown as Record<ScenarioName, ScenarioResult>,
          goalReverse: forecastRes.data.goal_reverse_engineering as unknown as GoalReverseEngineeringResult,
        }
      : undefined,
    startupCosts: startupCostsRes.data
      ? {
          items: startupCostsRes.data.items as unknown as (StartupCostItem & { total: number })[],
          total: startupCostsRes.data.total,
          minimum: startupCostsRes.data.minimum,
          recommended: startupCostsRes.data.recommended,
        }
      : undefined,
    packages: (packagesRes.data?.packages as unknown as ServicePackage[]) || [],
    marketing: marketingRes.data?.content as unknown as MarketingPlanOutput | undefined,
    salesKit: salesRes.data?.content as unknown as SalesKitOutput | undefined,
    launchTasks: launchTasksRes.data || [],
    risk: riskRes.data
      ? {
          risks: riskRes.data.risks as unknown as RiskAnalysisOutput["risks"],
          bestCase: (riskRes.data.best_case as unknown as { text: string })?.text,
          expectedCase: (riskRes.data.expected_case as unknown as { text: string })?.text,
          worstCase: (riskRes.data.worst_case as unknown as { text: string })?.text,
        }
      : undefined,
    classification: classificationRes.data?.content as unknown as ClassificationOutput | undefined,
    operations: operationsRes.data?.content as unknown as OperationsPlanOutput | undefined,
    businessPlan: businessPlanRes.data?.content as unknown as BusinessPlanOutput | undefined,
  };
});

export type ProjectBundle = Awaited<ReturnType<typeof getProjectBundle>>;
