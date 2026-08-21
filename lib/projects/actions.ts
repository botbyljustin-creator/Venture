"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { canCreateNewVenture } from "@/lib/permissions/entitlements";
import { wizardStepSchemas, defaultPreferences } from "@/lib/validation/wizard";
import { getTemplate } from "@/config/templates";
import type { Json } from "@/types/database";

export async function createDraftProjectAction(templateSlug?: string) {
  const user = await requireUser();
  const { allowed, reason } = await canCreateNewVenture(user.id);
  if (!allowed) {
    redirect(`/pricing?blocked=${encodeURIComponent(reason || "upgrade_required")}`);
  }

  const template = templateSlug ? getTemplate(templateSlug) : undefined;

  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: template ? `${template.name} Business` : "Untitled Venture",
      template_slug: templateSlug ?? null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !project) {
    throw new Error(error?.message || "Failed to create venture");
  }

  await supabase.from("project_inputs").insert({
    project_id: project.id,
    business_idea: template ? `I want to start a ${template.name.toLowerCase()} business.` : null,
    business_model: template ? ({ industry: template.industry, businessType: template.businessType } as unknown as Json) : {},
    preferences: defaultPreferences as unknown as Json,
    wizard_step: template ? 2 : 1,
  });

  redirect(`/ventures/${project.id}/wizard`);
}

export interface SaveWizardStepResult {
  error?: string;
  success?: boolean;
}

const STEP_COLUMN: Record<number, string> = {
  1: "business_idea",
  2: "location",
  3: "business_model",
  4: "owner_goals",
  5: "capital",
  6: "experience",
  7: "preferences",
};

export async function saveWizardStepAction(
  projectId: string,
  step: number,
  rawData: Record<string, unknown>
): Promise<SaveWizardStepResult> {
  const user = await requireUser();
  const schema = wizardStepSchemas[step as keyof typeof wizardStepSchemas];
  if (!schema) return { error: "Invalid wizard step" };

  const parsed = schema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();

  // Confirm the project belongs to the current user (RLS also enforces this).
  const { data: project } = await supabase.from("projects").select("id, user_id").eq("id", projectId).single();
  if (!project || project.user_id !== user.id) {
    return { error: "Venture not found" };
  }

  const column = STEP_COLUMN[step];
  const value = Object.values(parsed.data)[0];

  const { error } = await supabase
    .from("project_inputs")
    .update({
      [column]: value as unknown as Json,
      wizard_step: step,
      ...(step === 7 ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq("project_id", projectId);

  if (error) return { error: error.message };

  if (step === 1 && typeof value === "string") {
    const name = value.slice(0, 60).trim();
    if (name) {
      await supabase.from("projects").update({ name }).eq("id", projectId);
    }
  }

  revalidatePath(`/ventures/${projectId}/wizard`);
  return { success: true };
}

export async function deleteProjectAction(projectId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", projectId).eq("user_id", user.id);
  revalidatePath("/dashboard");
}

export async function duplicateProjectAction(projectId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: original } = await supabase.from("projects").select("*").eq("id", projectId).eq("user_id", user.id).single();
  if (!original) throw new Error("Venture not found");

  const { data: inputs } = await supabase.from("project_inputs").select("*").eq("project_id", projectId).single();

  const { data: copy, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: `${original.name} (Copy)`,
      template_slug: original.template_slug,
      industry: original.industry,
      business_type: original.business_type,
      country: original.country,
      region: original.region,
      city: original.city,
      service_radius: original.service_radius,
      business_scope: original.business_scope,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !copy) throw new Error(error?.message || "Failed to duplicate venture");

  if (inputs) {
    await supabase.from("project_inputs").insert({
      project_id: copy.id,
      business_idea: inputs.business_idea,
      location: inputs.location,
      business_model: inputs.business_model,
      owner_goals: inputs.owner_goals,
      capital: inputs.capital,
      experience: inputs.experience,
      preferences: inputs.preferences,
      wizard_step: 7,
      completed_at: new Date().toISOString(),
    });
  }

  revalidatePath("/dashboard");
  redirect(`/ventures/${copy.id}/wizard`);
}
