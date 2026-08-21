import { getAdminOverview, getRecentTransactions } from "@/lib/admin/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercent } from "@/lib/utils";

export const metadata = { title: "Admin Overview" };

export default async function AdminOverviewPage() {
  const [overview, transactions] = await Promise.all([getAdminOverview(), getRecentTransactions()]);

  const tiles = [
    { label: "Total Users", value: overview.totalUsers },
    { label: "New Users This Month", value: overview.newUsersThisMonth },
    { label: "Paid Users", value: overview.paidUsers },
    { label: "MRR", value: formatCurrency(overview.mrrCents / 100) },
    { label: "ARR", value: formatCurrency(overview.arrCents / 100) },
    { label: "One-Time Revenue", value: formatCurrency(overview.oneTimeRevenueCents / 100) },
    { label: "Projects Created", value: overview.projectsCreated },
    { label: "AI Generations", value: overview.aiGenerations },
    { label: "Estimated AI Cost", value: formatCurrency(overview.estimatedAiCostCents / 100) },
    { label: "Conversion Rate", value: formatPercent(overview.conversionRatePct) },
    { label: "Canceled Subscriptions", value: overview.canceledSubscriptions },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t.label}</p>
              <p className="mt-1 font-tabular text-2xl font-semibold">{t.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          {!transactions.length ? (
            <p className="text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {transactions.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium">{t.email}</p>
                    <p className="text-muted-foreground">{new Date(t.created_at).toLocaleString()} · {t.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-tabular font-medium">{formatCurrency(t.amount_cents / 100)}</p>
                    <Badge variant={t.status === "succeeded" ? "success" : "secondary"}>{t.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
