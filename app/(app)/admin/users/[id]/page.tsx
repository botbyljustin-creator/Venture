import { notFound } from "next/navigation";
import Link from "next/link";
import { getUserDetail } from "@/lib/admin/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "@/components/admin/user-actions";
import { formatCurrency } from "@/lib/utils";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile, projects, subscriptions, purchases, usage } = await getUserDetail(id);
  if (!profile) notFound();

  const activeSub = subscriptions.find((s) => s.status === "active" && s.stripe_subscription_id === null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{profile.email}</CardTitle>
            <p className="text-sm text-muted-foreground">{profile.full_name || "No name set"} · Joined {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-2">
            {profile.is_admin && <Badge>Admin</Badge>}
            {profile.disabled && <Badge variant="danger">Disabled</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <UserActions
            userId={profile.id}
            disabled={profile.disabled}
            isAdmin={profile.is_admin}
            activeManualSubscriptionId={activeSub?.id}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Subscriptions</CardTitle></CardHeader>
          <CardContent>
            {!subscriptions.length ? (
              <p className="text-sm text-muted-foreground">No subscriptions.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {subscriptions.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span className="capitalize">{s.plan}</span>
                    <Badge variant={s.status === "active" ? "success" : "secondary"}>{s.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Purchases</CardTitle></CardHeader>
          <CardContent>
            {!purchases.length ? (
              <p className="text-sm text-muted-foreground">No purchases.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {purchases.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span className="capitalize">{p.plan}</span>
                    <span className="font-tabular">{formatCurrency(p.amount_cents / 100)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Projects ({projects.length})</CardTitle></CardHeader>
        <CardContent>
          {!projects.length ? (
            <p className="text-sm text-muted-foreground">No ventures yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {projects.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/ventures/${p.id}`} className="font-medium text-primary hover:underline">{p.name}</Link>
                  <Badge variant="outline">{p.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent AI Usage</CardTitle></CardHeader>
        <CardContent>
          {!usage.length ? (
            <p className="text-sm text-muted-foreground">No AI usage recorded.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {usage.map((u) => (
                <li key={u.id} className="flex justify-between">
                  <span>{u.feature} ({u.model})</span>
                  <span className="font-tabular text-muted-foreground">{formatCurrency(Number(u.estimated_cost_cents) / 100)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
