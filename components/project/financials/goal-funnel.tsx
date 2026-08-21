import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { GoalReverseEngineeringResult } from "@/types/venture";

export function GoalFunnel({ goal }: { goal: GoalReverseEngineeringResult }) {
  const steps = [
    { label: "Target Owner Income", value: formatCurrency(goal.targetAnnualIncome) },
    { label: "Required Annual Profit", value: formatCurrency(goal.requiredAnnualProfit) },
    { label: "Required Annual Revenue", value: formatCurrency(goal.requiredAnnualRevenue) },
    { label: "Required Units / Year", value: formatNumber(goal.requiredUnitsPerYear) },
    { label: "Required Units / Month", value: formatNumber(goal.requiredUnitsPerMonth) },
    { label: "Required Units / Week", value: formatNumber(goal.requiredUnitsPerWeek) },
    { label: `Required Leads / Week (${goal.assumedCloseRatePct}% close rate)`, value: formatNumber(goal.requiredLeadsPerWeek) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>What Would Have To Be True?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center justify-between border-b border-border py-3 last:border-0">
              <span className="text-sm text-muted-foreground">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground">
                  {i + 1}
                </span>
                {s.label}
              </span>
              <span className="font-tabular font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
