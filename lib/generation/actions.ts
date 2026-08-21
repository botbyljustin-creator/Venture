"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

/**
 * Marks the project as queued for generation. The actual AI pipeline runs
 * via POST /api/projects/[id]/generate, triggered by the client once it has
 * navigated to the progress page — this keeps the long-running work off the
 * wizard's server action and lets the progress UI show live status.
 */
export async function startGenerationAction(projectId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("id, user_id").eq("id", projectId).single();
  if (!project || project.user_id !== user.id) {
    throw new Error("Venture not found");
  }

  await supabase
    .from("projects")
    .update({ status: "generating", generation_status: { currentStep: "classification", completedSteps: [] } })
    .eq("id", projectId);
}
