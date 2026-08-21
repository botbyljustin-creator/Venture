/**
 * Central model selection so cost/quality tradeoffs can be tuned in one
 * place. Cheap/fast models handle classification-style tasks; the stronger
 * model handles narrative and financial-judgment tasks. Override via env
 * vars without touching call sites.
 */
export const AI_MODELS = {
  /** Complex reasoning: market analysis, financial assumptions, business plan. */
  analysis: process.env.ANTHROPIC_MODEL_ANALYSIS || "claude-sonnet-5",
  /** Cheap/fast: classification, short structured extraction. */
  classification: process.env.ANTHROPIC_MODEL_CLASSIFICATION || "claude-haiku-4-5-20251001",
  /** Interactive chat advisor. */
  chat: process.env.ANTHROPIC_MODEL_ANALYSIS || "claude-sonnet-5",
} as const;

export type AiModelKey = keyof typeof AI_MODELS;

/**
 * Rough per-million-token pricing used only to populate ai_usage.estimated_cost_cents
 * for cost-control dashboards. Update if Anthropic pricing changes — this is
 * an estimate, not a billing source of truth.
 */
export const AI_PRICING_PER_MILLION_TOKENS_USD: Record<string, { input: number; output: number }> = {
  "claude-sonnet-5": { input: 3, output: 15 },
  "claude-opus-5": { input: 15, output: 75 },
  "claude-haiku-4-5-20251001": { input: 0.8, output: 4 },
};

export function estimateCostCents(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = AI_PRICING_PER_MILLION_TOKENS_USD[model] ?? AI_PRICING_PER_MILLION_TOKENS_USD["claude-sonnet-5"];
  const dollars = (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
  return Math.round(dollars * 100);
}
