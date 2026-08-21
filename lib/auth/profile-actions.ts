"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";

export interface ActionResult {
  error?: string;
  success?: boolean;
}

export async function updateProfileAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const fullName = String(formData.get("fullName") || "").trim();
  if (fullName.length < 2) return { error: "Enter your full name" };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/account");
  return { success: true };
}
