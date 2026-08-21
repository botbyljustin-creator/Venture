import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ScenarioName, ScenarioResult } from "@/types/venture";

const ORDER: ScenarioName[] = ["conservative", "expected", "aggressive"];
const LABELS: Record<ScenarioName, string> = { conservative: "Conservative", expected: "Expected", aggressive: "Aggressive" };

export function ScenarioComparison({ scenarios }: { scenarios: Record<ScenarioName, ScenarioResult> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Analysis</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {ORDER.map((name) => {
          const s = scenarios[name];
          return (
            <div
              key={name}
              className={cn(
                "rounded-lg border p-4",
                name === "expected" ? "border-primary bg-accent/40" : "border-border"
              )}
            >
              <p className="font-semibold">{LABELS[name]}</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year 1 Revenue</span>
                  <span className="font-tabular font-medium">{formatCurrency(s.year1Revenue, { compact: true })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Year 1 Profit</span>
                  <span className="font-tabular font-medium">{formatCurrency(s.year1Profit, { compact: true })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Break-Even</span>
                  <span className="font-tabular font-medium">{s.breakEvenMonth ? `Month ${s.breakEvenMonth}` : "12mo+"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
