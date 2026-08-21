import { getProjectBundle } from "@/lib/projects/data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UnitEconomicsCards } from "@/components/project/financials/unit-economics-cards";
import { MonthlyForecastChart } from "@/components/project/financials/monthly-forecast-chart";
import { MonthlyForecastTable } from "@/components/project/financials/monthly-forecast-table";
import { YearlyForecastTable } from "@/components/project/financials/yearly-forecast-table";
import { BreakEvenCard } from "@/components/project/financials/break-even-card";
import { ScenarioComparison } from "@/components/project/financials/scenario-comparison";
import { GoalFunnel } from "@/components/project/financials/goal-funnel";
import { WhatIfCalculator } from "@/components/project/financials/what-if-calculator";

export default async function FinancialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { forecast, assumptions } = await getProjectBundle(id);

  if (!forecast || !assumptions) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">Financial model not available yet.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <UnitEconomicsCards unit={forecast.unitEconomics} />

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">12-Month Forecast</TabsTrigger>
          <TabsTrigger value="yearly">Year 1-3</TabsTrigger>
          <TabsTrigger value="breakeven">Break-Even</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="whatif">What-If</TabsTrigger>
          <TabsTrigger value="goals">Goal Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-6">
              <MonthlyForecastChart data={forecast.monthly} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <MonthlyForecastTable rows={forecast.monthly} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yearly" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <YearlyForecastTable rows={forecast.yearly} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakeven" className="mt-6">
          <BreakEvenCard breakEven={forecast.breakEven} />
        </TabsContent>

        <TabsContent value="scenarios" className="mt-6">
          <ScenarioComparison scenarios={forecast.scenarios} />
        </TabsContent>

        <TabsContent value="whatif" className="mt-6">
          <WhatIfCalculator projectId={id} baseAssumptions={assumptions} />
        </TabsContent>

        <TabsContent value="goals" className="mt-6">
          <GoalFunnel goal={forecast.goalReverse} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
