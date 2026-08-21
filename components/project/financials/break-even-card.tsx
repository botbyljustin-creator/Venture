import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { BreakEvenResult } from "@/types/venture";

export function BreakEvenCard({ breakEven }: { breakEven: BreakEvenResult }) {
  const rows = [
    { label: "Fixed Monthly Expenses", value: formatCurrency(breakEven.fixedMonthlyExpenses) },
    { label: "Contribution Margin / Customer", value: formatCurrency(breakEven.contributionMarginPerCustomer) },
    { label: "Break-Even Customers / Month", value: String(breakEven.breakEvenCustomersPerMonth) },
    { label: "Break-Even Revenue / Month", value: formatCurrency(breakEven.breakEvenRevenuePerMonth) },
    {
      label: "Estimated Months Until Break-Even",
      value: breakEven.estimatedMonthsUntilBreakEven ? `Month ${breakEven.estimatedMonthsUntilBreakEven}` : "Beyond 12 months",
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Break-Even Analysis</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.label}</p>
            <p className="mt-1 font-tabular text-lg font-semibold">{r.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
