import type { StartupCostItem } from "@/types/venture";
import { round2 } from "./unitEconomics";

export interface StartupCostSummary {
  items: (StartupCostItem & { total: number })[];
  totalStartupInvestment: number;
  minimumStartupInvestment: number;
  recommendedStartupCapital: number;
}

const WORKING_CAPITAL_BUFFER_PCT = 15;

export function summarizeStartupCosts(items: StartupCostItem[]): StartupCostSummary {
  const withTotals = items.map((item) => ({
    ...item,
    total: round2(item.quantity * item.costEach * (item.haveIt ? 0 : 1)),
  }));

  const totalStartupInvestment = round2(sum(withTotals.map((i) => i.total)));
  const minimumStartupInvestment = round2(
    sum(withTotals.filter((i) => i.essential).map((i) => i.total))
  );
  const recommendedStartupCapital = round2(
    totalStartupInvestment * (1 + WORKING_CAPITAL_BUFFER_PCT / 100)
  );

  return { items: withTotals, totalStartupInvestment, minimumStartupInvestment, recommendedStartupCapital };
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}
