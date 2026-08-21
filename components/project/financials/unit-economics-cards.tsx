import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { UnitEconomics } from "@/types/venture";

export function UnitEconomicsCards({ unit }: { unit: UnitEconomics }) {
  const rows = [
    { label: "Average Sale Price", value: formatCurrency(unit.averagePrice) },
    { label: "Direct Labor", value: formatCurrency(unit.directLaborCost) },
    { label: "Direct Materials", value: formatCurrency(unit.directMaterialsCost) },
    { label: "Other Direct Cost", value: formatCurrency(unit.otherDirectCost) },
    { label: "Gross Profit / Unit", value: formatCurrency(unit.grossProfit) },
    { label: "Gross Margin", value: formatPercent(unit.grossMarginPct) },
    { label: "Customer Acquisition Cost", value: formatCurrency(unit.customerAcquisitionCost) },
    { label: "Contribution Margin", value: formatCurrency(unit.contributionMargin) },
    { label: "Estimated LTV", value: formatCurrency(unit.estimatedLTV) },
    { label: "LTV : CAC Ratio", value: `${unit.ltvToCacRatio.toFixed(1)}x` },
    { label: "Break-Even Customers/mo", value: String(unit.breakEvenCustomers) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map((r) => (
        <Card key={r.label}>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{r.label}</p>
            <p className="mt-1 font-tabular text-lg font-semibold">{r.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
