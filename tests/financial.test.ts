import { describe, it, expect } from "vitest";
import {
  calculateUnitEconomics,
  calculateMonthlyForecast,
  calculateYearlyForecast,
  calculateBreakEven,
  summarizeStartupCosts,
  calculateScenarios,
  calculateVentureScore,
  deriveProfitPotentialScore,
  deriveCashFlowScore,
  deriveStartupEfficiencyScore,
  scoreLabel,
  calculateGoalReverseEngineering,
} from "@/lib/financial";
import type { FinancialAssumptions, StartupCostItem } from "@/types/venture";

const pressureWashingAssumptions: FinancialAssumptions = {
  averagePrice: 350,
  startingCustomersPerMonth: 20,
  monthlyGrowthRatePct: 8,
  repeatPurchasesPerYear: 2,
  customerLifespanYears: 3,
  directLaborPctOfRevenue: 20,
  directMaterialsPctOfRevenue: 8,
  otherDirectCostPerUnit: 10,
  employees: 1,
  avgHourlyWage: 20,
  laborHoursPerUnit: 2,
  monthlyOverhead: 800,
  monthlyMarketingSpend: 1200,
  customerAcquisitionCost: 60,
  closeRatePct: 25,
  totalStartupCost: 14250,
  ownerAnnualIncomeGoal: 150000,
};

describe("calculateUnitEconomics", () => {
  it("computes gross profit, margin, and LTV:CAC deterministically", () => {
    const unit = calculateUnitEconomics(pressureWashingAssumptions);
    expect(unit.directLaborCost).toBeCloseTo(70, 2);
    expect(unit.directMaterialsCost).toBeCloseTo(28, 2);
    expect(unit.grossProfit).toBeCloseTo(350 - 70 - 28 - 10, 2);
    expect(unit.grossMarginPct).toBeGreaterThan(0);
    expect(unit.ltvToCacRatio).toBeGreaterThan(1);
  });

  it("never divides by zero when average price is 0", () => {
    const unit = calculateUnitEconomics({ ...pressureWashingAssumptions, averagePrice: 0 });
    expect(unit.grossMarginPct).toBe(0);
    expect(Number.isFinite(unit.grossMarginPct)).toBe(true);
  });
});

describe("calculateMonthlyForecast", () => {
  it("returns exactly 12 rows with compounding customer growth", () => {
    const rows = calculateMonthlyForecast(pressureWashingAssumptions);
    expect(rows).toHaveLength(12);
    expect(rows[0].customers).toBe(20);
    expect(rows[11].customers).toBeGreaterThan(rows[0].customers);
    // revenue must always equal customers * averagePrice
    for (const row of rows) {
      expect(row.revenue).toBeCloseTo(row.customers * pressureWashingAssumptions.averagePrice, 2);
    }
  });
});

describe("calculateYearlyForecast", () => {
  it("year 1 equals the sum of the 12 monthly rows", () => {
    const monthly = calculateMonthlyForecast(pressureWashingAssumptions);
    const yearly = calculateYearlyForecast(pressureWashingAssumptions, monthly);
    const expectedRevenue = monthly.reduce((sum, m) => sum + m.revenue, 0);
    expect(yearly[0].revenue).toBeCloseTo(expectedRevenue, 1);
    expect(yearly).toHaveLength(3);
    expect(yearly[1].revenue).toBeGreaterThan(yearly[0].revenue);
  });
});

describe("calculateBreakEven", () => {
  it("computes a positive break-even customer count for viable unit economics", () => {
    const monthly = calculateMonthlyForecast(pressureWashingAssumptions);
    const breakEven = calculateBreakEven(pressureWashingAssumptions, monthly);
    expect(breakEven.breakEvenCustomersPerMonth).toBeGreaterThan(0);
    expect(breakEven.contributionMarginPerCustomer).toBeGreaterThan(0);
  });

  it("returns null months-to-break-even when the model never turns EBITDA positive", () => {
    const badAssumptions: FinancialAssumptions = {
      ...pressureWashingAssumptions,
      averagePrice: 50,
      monthlyOverhead: 50000,
    };
    const monthly = calculateMonthlyForecast(badAssumptions);
    const breakEven = calculateBreakEven(badAssumptions, monthly);
    expect(breakEven.estimatedMonthsUntilBreakEven).toBeNull();
  });
});

describe("summarizeStartupCosts", () => {
  const items: StartupCostItem[] = [
    { id: "1", category: "Equipment", description: "Pressure washer", quantity: 1, costEach: 3500, essential: true },
    { id: "2", category: "Vehicle", description: "Used truck", quantity: 1, costEach: 8000, essential: true },
    { id: "3", category: "Marketing", description: "Website", quantity: 1, costEach: 750, essential: false },
  ];

  it("sums totals and applies the working capital buffer to recommended capital", () => {
    const summary = summarizeStartupCosts(items);
    expect(summary.totalStartupInvestment).toBeCloseTo(3500 + 8000 + 750, 2);
    expect(summary.minimumStartupInvestment).toBeCloseTo(3500 + 8000, 2);
    expect(summary.recommendedStartupCapital).toBeGreaterThan(summary.totalStartupInvestment);
  });

  it("excludes items the user already owns from the total", () => {
    const summary = summarizeStartupCosts([
      { id: "1", category: "Equipment", description: "Trailer", quantity: 1, costEach: 4000, essential: true, haveIt: true },
    ]);
    expect(summary.totalStartupInvestment).toBe(0);
  });
});

describe("calculateScenarios", () => {
  it("produces conservative <= expected <= aggressive year-1 revenue", () => {
    const scenarios = calculateScenarios(pressureWashingAssumptions);
    expect(scenarios.conservative.year1Revenue).toBeLessThanOrEqual(scenarios.expected.year1Revenue);
    expect(scenarios.expected.year1Revenue).toBeLessThanOrEqual(scenarios.aggressive.year1Revenue);
  });
});

describe("Venture Score", () => {
  it("weights the six categories to 100% and respects score bands", () => {
    const score = calculateVentureScore(80, 80, 80, { scalability: 80, ownerFreedom: 80, risk: 80 });
    expect(score.overall).toBe(80);
    expect(score.label).toBe("Excellent Opportunity");
  });

  it("derives profit potential, cash flow, and startup efficiency from the financial model", () => {
    const unit = calculateUnitEconomics(pressureWashingAssumptions);
    const monthly = calculateMonthlyForecast(pressureWashingAssumptions);
    const breakEven = calculateBreakEven(pressureWashingAssumptions, monthly);
    const profitPotential = deriveProfitPotentialScore(unit);
    const cashFlow = deriveCashFlowScore(pressureWashingAssumptions, breakEven);
    const startupEfficiency = deriveStartupEfficiencyScore(pressureWashingAssumptions.totalStartupCost);
    expect(profitPotential).toBeGreaterThanOrEqual(0);
    expect(profitPotential).toBeLessThanOrEqual(100);
    expect(cashFlow).toBeGreaterThanOrEqual(0);
    expect(startupEfficiency).toBeGreaterThanOrEqual(0);
  });

  it("labels bands correctly at boundaries", () => {
    expect(scoreLabel(95)).toBe("Exceptional Opportunity");
    expect(scoreLabel(82)).toBe("Excellent Opportunity");
    expect(scoreLabel(72)).toBe("Strong Opportunity");
    expect(scoreLabel(65)).toBe("Moderate Opportunity");
    expect(scoreLabel(55)).toBe("Challenging Opportunity");
    expect(scoreLabel(30)).toBe("High Risk");
  });
});

describe("calculateGoalReverseEngineering", () => {
  it("computes a funnel that closes the loop: leads * close rate >= units", () => {
    const result = calculateGoalReverseEngineering(pressureWashingAssumptions, 150000);
    expect(result.requiredAnnualRevenue).toBeGreaterThan(0);
    expect(result.requiredUnitsPerWeek).toBeGreaterThan(0);
    const impliedUnits = result.requiredLeadsPerWeek * (pressureWashingAssumptions.closeRatePct / 100);
    expect(impliedUnits).toBeGreaterThanOrEqual(result.requiredUnitsPerWeek - 1);
  });
});
