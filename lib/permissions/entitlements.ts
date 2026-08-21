import { createClient } from "@/lib/supabase/server";
import { entitlements, type PlanId } from "@/config/pricing";

export interface UserPlanInfo {
  plan: PlanId;
  isProOrAnnual: boolean;
}

/**
 * Server-authoritative plan lookup. NEVER trust a client-supplied plan —
 * this reads directly from the subscriptions table, which is only ever
 * written by Stripe webhooks via the service-role client.
 */
export async function getUserPlan(userId: string): Promise<UserPlanInfo> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data && (data.plan === "pro" || data.plan === "pro_annual")) {
    return { plan: data.plan as PlanId, isProOrAnnual: true };
  }
  return { plan: "free", isProOrAnnual: false };
}

export async function canCreateNewVenture(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const { isProOrAnnual } = await getUserPlan(userId);
  if (isProOrAnnual) return { allowed: true };

  const supabase = await createClient();
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_sample", false);

  const maxFreeVentures = entitlements.free.maxVentures;
  if ((count ?? 0) >= maxFreeVentures) {
    return { allowed: false, reason: "Free accounts can create 1 venture. Upgrade to Pro for unlimited ventures." };
  }
  return { allowed: true };
}

/** Whether a specific project has full (paid) access unlocked. */
export async function projectHasFullAccess(projectEntitlement: string, userId: string): Promise<boolean> {
  if (projectEntitlement === "launch" || projectEntitlement === "pro") return true;
  const { isProOrAnnual } = await getUserPlan(userId);
  return isProOrAnnual;
}

export function planFeatures(plan: PlanId) {
  return entitlements[plan];
}
