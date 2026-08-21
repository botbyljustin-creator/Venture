"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export async function toggleLaunchTaskAction(taskId: string, projectId: string, done: boolean) {
  await requireUser();
  const supabase = await createClient();
  await supabase
    .from("launch_tasks")
    .update({ status: done ? "done" : "pending" })
    .eq("id", taskId);
  revalidatePath(`/ventures/${projectId}/launch-plan`);
}
