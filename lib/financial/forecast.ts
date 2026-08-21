import type { FinancialAssumptions, MonthlyForecastRow, YearlyForecastRow } from "@/types/venture";
import { round2 } from "./unitEconomics";

/**
 * 12-month forecast. Customer count compounds monthly by the assumed growth
 * rate; revenue, COGS, and operating expenses derive directly from the
 * per-unit assumptions so every number traces back to an editable input.
 */
export function calculateMonthlyForecast(a: FinancialAssumptions): MonthlyForecastRow[] {
  const rows: MonthlyForecastRow[] = [];
  let customers = a.startingCustomersPerMonth;

  for (let month = 1; month <= 12; month++) {
    if (month > 1) {
      customers = customers * (1 + a.monthlyGrowthRatePct / 100);
    }
    const roundedCustomers = Math.round(customers);

    const revenue = roundedCustomers * a.averagePrice;
    const directLabor = revenue * (a.directLaborPctOfRevenue / 100);
    const directMaterials = revenue * (a.directMaterialsPctOfRevenue / 100);
    const otherDirect = roundedCustomers * a.otherDirectCostPerUnit;
    const cogs = directLabor + directMaterials + otherDirect;
    const grossProfit = revenue - cogs;

    const laborCost = a.employees * a.avgHourlyWage * 160; // ~160 hrs/mo per employee
    const operatingExpenses = a.monthlyOverhead + a.monthlyMarketingSpend + laborCost;

    const ebitda = grossProfit - operatingExpenses;
    const netMarginPct = revenue > 0 ? (ebitda / revenue) * 100 : 0;

    rows.push({
      month,
      customers: roundedCustomers,
      revenue: round2(revenue),
      cogs: round2(cogs),
      grossProfit: round2(grossProfit),
      operatingExpenses: round2(operatingExpenses),
      ebitda: round2(ebitda),
      netMarginPct: round2(netMarginPct),
    });
  }

  return rows;
}

/**
 * Year 1 sums the 12-month forecast. Years 2-3 apply a compounding annual
 * growth rate off the Year 1 base (capped to something realistic) so the
 * model doesn't imply infinite month-over-month compounding forever.
 */
export function calculateYearlyForecast(
  a: FinancialAssumptions,
  monthly: MonthlyForecastRow[],
  annualGrowthRatePct = 25
): YearlyForecastRow[] {
  const year1Revenue = sum(monthly.map((m) => m.revenue));
  const year1GrossProfit = sum(monthly.map((m) => m.grossProfit));
  const year1OpEx = sum(monthly.map((m) => m.operatingExpenses));
  const year1OperatingProfit = year1GrossProfit - year1OpEx;
  const year1Customers = monthly[monthly.length - 1]?.customers ?? 0;

  const years: YearlyForecastRow[] = [
    {
      year: 1,
      revenue: round2(year1Revenue),
      grossProfit: round2(year1GrossProfit),
      operatingExpenses: round2(year1OpEx),
      operatingProfit: round2(year1OperatingProfit),
      estimatedOwnerIncome: round2(Math.max(year1OperatingProfit, 0)),
      employees: a.employees,
      customers: year1Customers,
    },
  ];

  let prevRevenue = year1Revenue;
  let prevGrossMarginPct = year1Revenue > 0 ? year1GrossProfit / year1Revenue : 0;
  let prevOpExPct = year1Revenue > 0 ? year1OpEx / year1Revenue : 0;
  let prevCustomers = year1Customers;
  let prevEmployees = a.employees;

  for (const year of [2, 3] as const) {
    const revenue = prevRevenue * (1 + annualGrowthRatePct / 100);
    const grossProfit = revenue * prevGrossMarginPct;
    const employees = Math.max(prevEmployees, Math.ceil(prevEmployees * (1 + annualGrowthRatePct / 200)));
    const operatingExpenses = revenue * prevOpExPct;
    const operatingProfit = grossProfit - operatingExpenses;
    const customers = Math.round(prevCustomers * (1 + annualGrowthRatePct / 100));

    years.push({
      year,
      revenue: round2(revenue),
      grossProfit: round2(grossProfit),
      operatingExpenses: round2(operatingExpenses),
      operatingProfit: round2(operatingProfit),
      estimatedOwnerIncome: round2(Math.max(operatingProfit, 0)),
      employees,
      customers,
    });

    prevRevenue = revenue;
    prevCustomers = customers;
    prevEmployees = employees;
  }

  return years;
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}
