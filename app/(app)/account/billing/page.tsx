import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getUserPlan } from "@/lib/permissions/entitlements";
import { plans } from "@/config/pricing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { PortalButton } from "@/components/billing/portal-button";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { plan } = await getUserPlan(user.id);

  const { data: profile } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();
  const { data: purchases } = await supabase.from("purchases").select("*").eq("user_id", user.id).order("created_at", { ascending: false });

  const currentPlan = plans.find((p) => p.id === plan)!;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current Plan</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{currentPlan.description}</p>
          </div>
          <Badge>{currentPlan.name}</Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {plan === "free" ? (
            <>
              <CheckoutButton plan="pro">Upgrade to Pro — $19/mo</CheckoutButton>
              <CheckoutButton plan="pro_annual" variant="outline">Pro Annual — $199/yr</CheckoutButton>
            </>
          ) : (
            profile?.stripe_customer_id && <PortalButton />
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader><CardTitle>Purchase History</CardTitle></CardHeader>
        <CardContent>
          {!purchases?.length ? (
            <p className="text-sm text-muted-foreground">No one-time purchases yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {purchases.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-medium capitalize">{p.plan} Plan</p>
                    <p className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-tabular font-medium">{formatCurrency(p.amount_cents / 100)}</p>
                    <Badge variant={p.status === "succeeded" ? "success" : "secondary"}>{p.status}</Badge>
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
