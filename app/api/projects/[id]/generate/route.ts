import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkDailyAiQuota } from "@/lib/ai/usage";
import { runGenerationPipeline } from "@/lib/generation/pipeline";

// Full venture generation runs ~10 sequential/parallel Claude calls and can
// take well over the default serverless timeout. Requires a Vercel plan
// with an extended function duration (Pro/Fluid Compute) for production use.
export const maxDuration = 300;

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: project } = await supabase.from("projects").select("id, user_id, status").eq("id", id).single();
  if (!project || project.user_id !== user.id) {
    return NextResponse.json({ error: "Venture not found" }, { status: 404 });
  }

  if (project.status === "ready") {
    return NextResponse.json({ status: "ready" });
  }

  const quota = await checkDailyAiQuota(user.id, "generation");
  if (!quota.allowed) {
    return NextResponse.json(
      { error: `Daily generation limit reached (${quota.used}/${quota.limit}). Try again tomorrow.` },
      { status: 429 }
    );
  }

  try {
    await runGenerationPipeline(id, user.id);
    return NextResponse.json({ status: "ready" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
