import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const sampleMetrics = [
  { label: "Startup Investment", value: 14250 },
  { label: "Year 1 Revenue", value: 187000 },
  { label: "Year 1 Profit", value: 48300 },
];

export function SampleResults() {
  return (
    <section id="sample-results" className="border-y border-border bg-muted/30 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">See What You Get</h2>
          <p className="mt-3 text-muted-foreground">
            A real sample: pressure washing in Tampa, Florida.
          </p>
        </div>
        <Card className="mx-auto mt-12 max-w-3xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pressure Washing Co.</CardTitle>
              <p className="text-sm text-muted-foreground">Tampa, Florida · Local Service Business</p>
            </div>
            <Badge variant="success">Excellent Opportunity</Badge>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
              <ScoreGauge score={82} />
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
                {sampleMetrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
                    <p className="mt-1 font-tabular text-2xl font-semibold">{formatCurrency(m.value, { compact: true })}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-6 rounded-lg bg-accent p-4 text-sm text-accent-foreground">
              &ldquo;Strong opportunity if the company can consistently acquire 6–8 qualified jobs per
              week while maintaining an average ticket above $700.&rdquo;
            </p>
          </CardContent>
        </Card>
        <div className="mt-8 text-center">
          <Link href="/signup" className={buttonVariants()}>
            Generate My Own Report
          </Link>
        </div>
      </div>
    </section>
  );
}
