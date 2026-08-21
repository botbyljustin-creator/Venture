import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProjectBundle } from "@/lib/projects/data";
import { buildProjectChatContext } from "@/lib/projects/context";
import { generateChatAnswer, type ChatMessage } from "@/lib/ai/modules/chat";
import { logAiUsage, checkDailyAiQuota } from "@/lib/ai/usage";
import { projectHasFullAccess } from "@/lib/permissions/entitlements";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { question } = await request.json();
  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "Question is required" }, { status: 400 });
  }

  const bundle = await getProjectBundle(id);
  if (bundle.project.user_id !== user.id) {
    return NextResponse.json({ error: "Venture not found" }, { status: 404 });
  }

  const hasAccess = await projectHasFullAccess(bundle.project.entitlement, user.id);
  if (!hasAccess) {
    return NextResponse.json({ error: "Upgrade to Pro or purchase this venture to use the AI Advisor." }, { status: 403 });
  }

  const quota = await checkDailyAiQuota(user.id, "chat");
  if (!quota.allowed) {
    return NextResponse.json({ error: `Daily chat limit reached (${quota.used}/${quota.limit}).` }, { status: 429 });
  }

  const { data: historyRows } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("project_id", id)
    .order("created_at", { ascending: true })
    .limit(20);

  const history: ChatMessage[] = (historyRows || []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  const context = buildProjectChatContext(bundle);

  await supabase.from("ai_chat_messages").insert({ project_id: id, user_id: user.id, role: "user", content: question });

  try {
    const result = await generateChatAnswer(context, history, question);
    await logAiUsage({
      userId: user.id,
      projectId: id,
      feature: "chat",
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      estimatedCostCents: result.estimatedCostCents,
    });

    await supabase.from("ai_chat_messages").insert({ project_id: id, user_id: user.id, role: "assistant", content: result.data.answer });

    return NextResponse.json({ answer: result.data.answer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate a response";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
