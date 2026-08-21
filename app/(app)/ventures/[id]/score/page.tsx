import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { Progress } from "@/components/ui/progress";

const CATEGORY_LABELS: Record<string, { label: string; weight: string }> = {
  profit_potential: { label: "Profit Potential", weight: "20%" },
  cash_flow: { label: "Cash Flow", weight: "20%" },
  scalability: { label: "Scalability", weight: "20%" },
  owner_freedom: { label: "Owner Freedom", weight: "15%" },
  startup_efficiency: { label: "Startup Efficiency", weight: "10%" },
  risk: { label: "Risk (higher = safer)", weight: "15%" },
};

export default async function ScorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { score } = await getProjectBundle(id);

  if (!score) {
    return <p className="text-muted-foreground">Score not available yet.</p>;
  }

  const categories: [string, number][] = [
    ["profit_potential", score.profit_potential],
    ["cash_flow", score.cash_flow],
    ["scalability", score.scalability],
    ["owner_freedom", score.owner_freedom],
    ["startup_efficiency", score.startup_efficiency],
    ["risk", score.risk],
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Venture Score</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
          <ScoreGauge score={score.overall} size={140} />
          <div>
            <p className="text-2xl font-semibold">{score.label}</p>
            {score.verdict && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{score.verdict}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {categories.map(([key, value]) => (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {CATEGORY_LABELS[key].label}{" "}
                  <span className="text-xs font-normal text-muted-foreground">({CATEGORY_LABELS[key].weight} weight)</span>
                </span>
                <span className="font-tabular font-medium">{value}/100</span>
              </div>
              <Progress value={value} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 text-xs text-muted-foreground sm:grid-cols-3">
        <p><strong>90-100</strong> Exceptional</p>
        <p><strong>80-89</strong> Excellent</p>
        <p><strong>70-79</strong> Strong</p>
        <p><strong>60-69</strong> Moderate</p>
        <p><strong>50-59</strong> Challenging</p>
        <p><strong>Below 50</strong> High Risk</p>
      </div>
    </div>
  );
}
