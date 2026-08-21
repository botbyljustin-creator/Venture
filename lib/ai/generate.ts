import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropicClient } from "./client";
import { estimateCostCents } from "./models";

export interface GenerateStructuredOptions<T extends z.ZodTypeAny> {
  model: string;
  system: string;
  prompt: string;
  schema: T;
  toolName?: string;
  maxTokens?: number;
  maxRetries?: number;
}

export interface GenerateStructuredResult<T> {
  data: T;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostCents: number;
}

/**
 * Calls Claude with the response shape enforced via tool-use (function
 * calling), so the model is constrained to emit JSON matching the given Zod
 * schema. The raw response is validated with Zod before it's trusted; on
 * validation failure the error is fed back to the model and retried up to
 * `maxRetries` times. Callers never see unvalidated AI output.
 */
export async function generateStructured<T extends z.ZodTypeAny>(
  opts: GenerateStructuredOptions<T>
): Promise<GenerateStructuredResult<z.infer<T>>> {
  const { model, system, schema, maxTokens = 4096, maxRetries = 2 } = opts;
  const toolName = opts.toolName || "emit_result";
  const client = getAnthropicClient();
  const jsonSchema = z.toJSONSchema(schema, { target: "draft-7" });

  let lastError: string | null = null;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const userPrompt = lastError
      ? `${opts.prompt}\n\nYour previous response failed validation with this error:\n${lastError}\nPlease call the ${toolName} tool again with corrected data that matches the schema exactly.`
      : opts.prompt;

    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: userPrompt }],
      tools: [
        {
          name: toolName,
          description: "Emit the structured result. Always call this tool with your complete answer.",
          input_schema: jsonSchema as Anthropic.Tool.InputSchema,
        },
      ],
      tool_choice: { type: "tool", name: toolName },
    });

    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (!toolUse) {
      lastError = "No tool_use block was returned.";
      continue;
    }

    const parsed = schema.safeParse(toolUse.input);
    if (parsed.success) {
      return {
        data: parsed.data,
        model,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        estimatedCostCents: estimateCostCents(model, totalInputTokens, totalOutputTokens),
      };
    }

    lastError = JSON.stringify(parsed.error.issues.slice(0, 8));
  }

  throw new AiValidationError(
    `AI response failed schema validation after ${maxRetries + 1} attempts: ${lastError}`,
    { inputTokens: totalInputTokens, outputTokens: totalOutputTokens, model }
  );
}

export class AiValidationError extends Error {
  usage: { inputTokens: number; outputTokens: number; model: string };
  constructor(message: string, usage: { inputTokens: number; outputTokens: number; model: string }) {
    super(message);
    this.name = "AiValidationError";
    this.usage = usage;
  }
}
