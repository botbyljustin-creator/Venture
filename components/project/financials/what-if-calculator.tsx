"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { calculateMonthlyForecast, calculateYearlyForecast, calculateBreakEven } from "@/lib/financial";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { FinancialAssumptions } from "@/types/venture";

interface SliderField {
  key: keyof FinancialAssumptions;
  label: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}

const FIELDS: SliderField[] = [
  { key: "averagePrice", label: "Average Price", min: 10, max: 2000, step: 5, format: (v) => formatCurrency(v) },
  { key: "startingCustomersPerMonth", label: "Starting Customers/Month", min: 1, max: 200, step: 1, format: (v) => String(v) },
  { key: "employees", label: "Employees", min: 0, max: 20, step: 1, format: (v) => String(v) },
  { key: "avgHourlyWage", label: "Average Wage", min: 10, max: 80, step: 1, format: (v) => `${formatCurrency(v)}/hr` },
  { key: "directMaterialsPctOfRevenue", label: "Material % of Revenue", min: 0, max: 60, step: 1, format: (v) => formatPercent(v, 0) },
  { key: "monthlyMarketingSpend", label: "Marketing Spend/Month", min: 0, max: 10000, step: 50, format: (v) => formatCurrency(v) },
  { key: "monthlyOverhead", label: "Overhead/Month", min: 0, max: 20000, step: 50, format: (v) => formatCurrency(v) },
  { key: "closeRatePct", label: "Close Rate", min: 1, max: 100, step: 1, format: (v) => formatPercent(v, 0) },
];

export function WhatIfCalculator({ baseAssumptions }: { baseAssumptions: FinancialAssumptions }) {
  const [assumptions, setAssumptions] = useState<FinancialAssumptions>(baseAssumptions);

  const result = useMemo(() => {
    const monthly = calculateMonthlyForecast(assumptions);
    const yearly = calculateYearlyForecast(assumptions, monthly);
    const breakEven = calculateBreakEven(assumptions, monthly);
    return { yearly: yearly[0], breakEven };
  }, [assumptions]);

  function update(key: keyof FinancialAssumptions, value: number) {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What-If Calculator</CardTitle>
        <CardDescription>Drag any input to see the impact instantly — recalculated in your browser.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-5">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{f.label}</span>
                  <span className="font-tabular">{f.format(assumptions[f.key] as number)}</span>
                </div>
                <Slider
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  value={assumptions[f.key] as number}
                  onChange={(e) => update(f.key, Number(e.target.value))}
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 content-start gap-4 self-start rounded-lg bg-muted/50 p-6">
            <ResultTile label="Revenue" value={formatCurrency(result.yearly.revenue, { compact: true })} />
            <ResultTile label="Gross Profit" value={formatCurrency(result.yearly.grossProfit, { compact: true })} />
            <ResultTile label="Operating Profit" value={formatCurrency(result.yearly.operatingProfit, { compact: true })} />
            <ResultTile label="Owner Income" value={formatCurrency(result.yearly.estimatedOwnerIncome, { compact: true })} />
            <ResultTile
              label="Net Margin"
              value={formatPercent(result.yearly.revenue > 0 ? (result.yearly.operatingProfit / result.yearly.revenue) * 100 : 0)}
            />
            <ResultTile
              label="Break-Even"
              value={result.breakEven.estimatedMonthsUntilBreakEven ? `Month ${result.breakEven.estimatedMonthsUntilBreakEven}` : "12mo+"}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-tabular text-xl font-semibold">{value}</p>
    </div>
  );
}
