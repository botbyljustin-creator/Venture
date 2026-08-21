import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function levelVariant(level: string) {
  if (level === "high") return "danger" as const;
  if (level === "medium") return "warning" as const;
  return "secondary" as const;
}

export default async function RisksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { risk } = await getProjectBundle(id);

  if (!risk) return <p className="text-muted-foreground">Risk analysis not available yet.</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Top Risks</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {risk.risks.map((r) => (
            <div key={r.risk} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{r.risk}</p>
                <div className="flex gap-2">
                  <Badge variant={levelVariant(r.probability)}>Probability: {r.probability}</Badge>
                  <Badge variant={levelVariant(r.impact)}>Impact: {r.impact}</Badge>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Mitigation: </span>{r.mitigation}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-success">Best Case</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{risk.bestCase}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Expected Case</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{risk.expectedCase}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-danger">Worst Case</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">{risk.worstCase}</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
