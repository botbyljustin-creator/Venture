import { createAdminClient } from "@/lib/supabase/admin";
import { getPlan } from "@/config/pricing";

export interface AdminOverview {
  totalUsers: number;
  newUsersThisMonth: number;
  paidUsers: number;
  mrrCents: number;
  arrCents: number;
  oneTimeRevenueCents: number;
  projectsCreated: number;
  aiGenerations: number;
  estimatedAiCostCents: number;
  conversionRatePct: number;
  canceledSubscriptions: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const admin = createAdminClient();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: newUsersThisMonth },
    { data: activeSubs },
    { data: purchases },
    { count: projectsCreated },
    { count: aiGenerations },
    { data: usageRows },
    { count: canceledSubscriptions },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    admin.from("subscriptions").select("user_id, plan").in("status", ["active", "trialing"]),
    admin.from("purchases").select("amount_cents").eq("status", "succeeded"),
    admin.from("projects").select("id", { count: "exact", head: true }),
    admin.from("ai_usage").select("id", { count: "exact", head: true }).eq("feature", "classification"),
    admin.from("ai_usage").select("estimated_cost_cents"),
    admin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "canceled"),
  ]);

  const proPrice = getPlan("pro").priceCents;
  const proAnnualMonthlyEquivalent = Math.round(getPlan("pro_annual").priceCents / 12);

  const mrrCents = (activeSubs || []).reduce((sum, s) => {
    return sum + (s.plan === "pro_annual" ? proAnnualMonthlyEquivalent : proPrice);
  }, 0);

  const paidUserIds = new Set((activeSubs || []).map((s) => s.user_id));
  const oneTimeRevenueCents = (purchases || []).reduce((sum, p) => sum + p.amount_cents, 0);
  const estimatedAiCostCents = (usageRows || []).reduce((sum, u) => sum + Number(u.estimated_cost_cents), 0);

  return {
    totalUsers: totalUsers ?? 0,
    newUsersThisMonth: newUsersThisMonth ?? 0,
    paidUsers: paidUserIds.size,
    mrrCents,
    arrCents: mrrCents * 12,
    oneTimeRevenueCents,
    projectsCreated: projectsCreated ?? 0,
    aiGenerations: aiGenerations ?? 0,
    estimatedAiCostCents,
    conversionRatePct: totalUsers ? (paidUserIds.size / totalUsers) * 100 : 0,
    canceledSubscriptions: canceledSubscriptions ?? 0,
  };
}

export async function searchUsers(query: string) {
  const admin = createAdminClient();
  let q = admin.from("profiles").select("id, email, full_name, is_admin, disabled, created_at").order("created_at", { ascending: false }).limit(50);
  if (query) q = q.ilike("email", `%${query}%`);
  const { data } = await q;
  return data || [];
}

export async function getUserDetail(userId: string) {
  const admin = createAdminClient();
  const [{ data: profile }, { data: projects }, { data: subscriptions }, { data: purchases }, { data: usage }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).single(),
    admin.from("projects").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("purchases").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("ai_usage").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(20),
  ]);

  return { profile, projects: projects || [], subscriptions: subscriptions || [], purchases: purchases || [], usage: usage || [] };
}

export async function getRecentTransactions() {
  const admin = createAdminClient();
  const { data: purchases } = await admin
    .from("purchases")
    .select("id, plan, amount_cents, status, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(15);

  if (!purchases?.length) return [];

  const userIds = [...new Set(purchases.map((p) => p.user_id))];
  const { data: profiles } = await admin.from("profiles").select("id, email").in("id", userIds);
  const emailById = new Map((profiles || []).map((p) => [p.id, p.email]));

  return purchases.map((p) => ({ ...p, email: emailById.get(p.user_id) || "—" }));
}
