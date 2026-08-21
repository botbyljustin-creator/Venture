import { createAdminClient } from "@/lib/supabase/admin";

export interface LogAiUsageInput {
  userId: string;
  projectId?: string | null;
  feature: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostCents: number;
}

export async function logAiUsage(input: LogAiUsageInput) {
  const admin = createAdminClient();
  await admin.from("ai_usage").insert({
    user_id: input.userId,
    project_id: input.projectId ?? null,
    feature: input.feature,
    model: input.model,
    input_tokens: input.inputTokens,
    output_tokens: input.outputTokens,
    estimated_cost_cents: input.estimatedCostCents,
  });
}

const DAILY_GENERATION_LIMIT = 20; // full venture generations per user per day
const DAILY_CHAT_LIMIT = 100; // chat messages per user per day

/**
 * Coarse per-user daily quota check backed by the ai_usage log. Not a
 * substitute for a production rate limiter (e.g. Upstash) under heavy load,
 * but prevents runaway API cost from a single account without extra
 * infrastructure. See README "Known limitations".
 */
export async function checkDailyAiQuota(
  userId: string,
  feature: "generation" | "chat"
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const admin = createAdminClient();
  const since = new Date();
  since.setHours(since.getHours() - 24);

  const limit = feature === "generation" ? DAILY_GENERATION_LIMIT : DAILY_CHAT_LIMIT;
  const featureFilter = feature === "generation" ? "classification" : "chat";

  const { count } = await admin
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("feature", featureFilter)
    .gte("created_at", since.toISOString());

  const used = count ?? 0;
  return { allowed: used < limit, used, limit };
}
