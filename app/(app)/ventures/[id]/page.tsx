import Link from "next/link";
import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { formatCurrency } from "@/lib/utils";
import { appConfig } from "@/config/app";

export default async function VentureOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bundle = await getProjectBundle(id);
  const { project, score, forecast, startupCosts } = bundle;

  const metrics = [
    { label: "Startup Capital", value: startupCosts ? formatCurrency(startupCosts.total, { compact: true }) : "—" },
    { label: "Year 1 Revenue", value: forecast ? formatCurrency(forecast.yearly[0]?.revenue || 0, { compact: true }) : "—" },
    { label: "Year 1 Profit", value: forecast ? formatCurrency(forecast.yearly[0]?.operatingProfit || 0, { compact: true }) : "—" },
    {
      label: "Break-Even",
      value: forecast?.breakEven.estimatedMonthsUntilBreakEven
        ? `Month ${forecast.breakEven.estimatedMonthsUntilBreakEven}`
        : "Beyond Year 1",
    },
  ];

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Business Viability Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            {score && <ScoreGauge score={score.overall} size={110} />}
            <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  <p className="mt-1 font-tabular text-xl font-semibold">{m.value}</p>
                </div>
              ))}
            </div>
          </div>
          {score?.verdict && (
            <p className="mt-6 rounded-lg bg-accent p-4 text-sm text-accent-foreground">
              <span className="font-medium">Verdict: </span>
              {score.verdict}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <QuickLinkCard href={`/ventures/${id}/score`} title="Venture Score" body="See the six-category breakdown behind your score." />
        <QuickLinkCard href={`/ventures/${id}/financials`} title="Financial Model" body="Unit economics, 12-month forecast, break-even, scenarios." />
        <QuickLinkCard href={`/ventures/${id}/launch-plan`} title="30-Day Launch Plan" body="A week-by-week checklist to get to your first customer." />
        <QuickLinkCard href={`/ventures/${id}/export`} title="Export Report" body="Download a professional PDF or Excel report." />
      </div>

      <p className="text-xs text-muted-foreground">{appConfig.disclaimer}</p>
    </div>
  );
}

function QuickLinkCard({ href, title, body }: { href: string; title: string; body: string }) {
  return (
    <Link href={href}>
      <Card className="h-full transition-colors hover:border-primary">
        <CardContent className="p-6">
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
