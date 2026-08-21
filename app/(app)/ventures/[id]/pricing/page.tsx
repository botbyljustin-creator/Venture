import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";

const TIER_LABEL: Record<string, string> = { starter: "Starter", core: "Core", premium: "Premium" };

export default async function PricingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { packages } = await getProjectBundle(id);

  if (!packages.length) {
    return <p className="text-muted-foreground">Pricing packages not available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {packages.map((p) => {
        const grossProfit = p.customerPrice - p.estimatedLaborCost - p.materialCost;
        const margin = p.customerPrice > 0 ? (grossProfit / p.customerPrice) * 100 : 0;
        return (
          <Card key={p.id} className={p.tier === "core" ? "border-primary ring-1 ring-primary" : ""}>
            <CardHeader>
              <Badge variant="outline" className="mb-2 w-fit">{TIER_LABEL[p.tier] || p.tier}</Badge>
              <CardTitle>{p.name}</CardTitle>
              <p className="text-3xl font-semibold font-tabular">{formatCurrency(p.customerPrice)}</p>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {p.includedServices.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {s}
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-1.5 border-t border-border pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Labor</span><span className="font-tabular">{formatCurrency(p.estimatedLaborCost)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Materials</span><span className="font-tabular">{formatCurrency(p.materialCost)}</span></div>
                <div className="flex justify-between font-medium"><span>Gross Profit</span><span className="font-tabular">{formatCurrency(grossProfit)}</span></div>
                <div className="flex justify-between font-medium"><span>Gross Margin</span><span className="font-tabular">{formatPercent(margin)}</span></div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
