import { generateStructured } from "../generate";
import { chatResponseSchema } from "../schemas";
import { AI_MODELS } from "../models";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_SYSTEM_PROMPT = `You are "Ask VentureForge", an AI advisor embedded inside a specific business venture project. Answer using the project's stored assumptions and computed financials given to you as context — never invent numbers that contradict them. If the user asks a "what if" question that changes an assumption, reason through the directional impact using the same math logic (price × volume - costs) and give a concrete, numeric, opinionated answer. Keep answers focused and under 200 words unless the question requires a list.`;

export async function generateChatAnswer(
  projectContext: string,
  history: ChatMessage[],
  question: string
) {
  const transcript = history.map((m) => `${m.role === "user" ? "User" : "Advisor"}: ${m.content}`).join("\n");

  return generateStructured({
    model: AI_MODELS.chat,
    system: CHAT_SYSTEM_PROMPT,
    toolName: "emit_chat_answer",
    schema: chatResponseSchema,
    maxTokens: 1200,
    prompt: `PROJECT CONTEXT:
${projectContext}

${transcript ? `CONVERSATION SO FAR:\n${transcript}\n` : ""}
User's new question: ${question}`,
  });
}
