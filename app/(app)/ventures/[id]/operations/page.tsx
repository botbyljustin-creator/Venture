import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OperationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { operations, classification, businessPlan } = await getProjectBundle(id);

  return (
    <div className="space-y-6">
      {operations && (
        <>
          <Card>
            <CardHeader><CardTitle>Day-to-Day Operations</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-wrap text-sm text-muted-foreground">{operations.dayToDayOperations}</p></CardContent>
          </Card>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Staffing Plan</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap text-sm text-muted-foreground">{operations.staffingPlan}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Equipment Needed</CardTitle></CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {operations.equipmentNeeded.map((e) => <li key={e}>{e}</li>)}
                </ul>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Key Processes</CardTitle></CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {operations.keyProcesses.map((p) => <li key={p} className="rounded-lg bg-muted/50 p-3 text-muted-foreground">{p}</li>)}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {classification && (
        <Card>
          <CardHeader><CardTitle>Competitive Landscape</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><span className="font-medium text-foreground">Target Customer: </span>{classification.targetCustomer}</p>
            <p>{classification.competitiveLandscapeSummary}</p>
          </CardContent>
        </Card>
      )}

      {businessPlan && (
        <Card>
          <CardHeader><CardTitle>Full Business Plan</CardTitle></CardHeader>
          <CardContent className="space-y-5 text-sm">
            {(
              [
                ["Executive Summary", businessPlan.executiveSummary],
                ["Business Concept", businessPlan.businessConcept],
                ["Target Customer", businessPlan.targetCustomer],
                ["Customer Problem", businessPlan.customerProblem],
                ["Solution", businessPlan.solution],
                ["Competitive Advantage", businessPlan.competitiveAdvantage],
                ["Pricing Strategy", businessPlan.pricingStrategy],
                ["Revenue Model", businessPlan.revenueModel],
                ["Sales Strategy", businessPlan.salesStrategy],
                ["Financial Outlook", businessPlan.financialOutlook],
                ["Growth Strategy", businessPlan.growthStrategy],
                ["Owner Objectives", businessPlan.ownerObjectives],
              ] as [string, string][]
            ).map(([title, body]) => (
              <div key={title}>
                <p className="font-medium">{title}</p>
                <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
