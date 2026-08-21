/**
 * Seeds the public sample venture shown on the landing page and used to
 * demonstrate a finished report before signup.
 *
 * Requires a fully configured environment (Supabase + Anthropic) since it
 * runs the real generation pipeline — no fake/static data is inserted.
 *
 * Usage:
 *   cp .env.example .env.local   # fill in real values first
 *   npm run seed
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { runGenerationPipeline } from "@/lib/generation/pipeline";
import { defaultPreferences } from "@/lib/validation/wizard";

const SAMPLE_EMAIL = "sample-ventures@ventureforge.app";

async function main() {
  const admin = createAdminClient();

  // Find or create the account that owns the public sample project.
  let userId: string;
  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existing = existingUsers.users.find((u) => u.email === SAMPLE_EMAIL);

  if (existing) {
    userId = existing.id;
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: SAMPLE_EMAIL,
      email_confirm: true,
      user_metadata: { full_name: "VentureForge Sample" },
      password: crypto.randomUUID(),
    });
    if (error || !created.user) throw new Error(`Failed to create sample user: ${error?.message}`);
    userId = created.user.id;
    // profiles row is created by the on_auth_user_created trigger.
  }

  // Reuse an existing sample project if one already exists so re-running
  // the seed just regenerates it instead of creating duplicates.
  const { data: existingProject } = await admin
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .eq("is_sample", true)
    .maybeSingle();

  let projectId: string;
  if (existingProject) {
    projectId = existingProject.id;
  } else {
    const { data: project, error } = await admin
      .from("projects")
      .insert({ user_id: userId, name: "Pressure Washing Co.", is_sample: true, entitlement: "pro", status: "draft" })
      .select("id")
      .single();
    if (error || !project) throw new Error(`Failed to create sample project: ${error?.message}`);
    projectId = project.id;
  }

  await admin.from("project_inputs").upsert(
    {
      project_id: projectId,
      business_idea: "I want to start a pressure washing business in Tampa, Florida.",
      location: { country: "United States", region: "Florida", city: "Tampa", serviceRadius: "20 miles", scope: "local" },
      business_model: { industry: "Pressure Washing", businessType: "service" },
      owner_goals: {
        targetAnnualIncome: 120000,
        targetAnnualRevenue: 250000,
        desiredWeeklyHours: 45,
        desiredEmployees: 1,
        involvement: "owner_operator",
      },
      capital: { band: "10k_25k" },
      experience: {
        industryExperience: "Some DIY pressure washing experience",
        salesExperience: "None",
        managementExperience: "None",
        existingEquipment: "Pickup truck",
        existingNetwork: "A few neighbors and local contacts",
      },
      preferences: { ...defaultPreferences, cashFlow: 5, lowStartupCost: 4, recurringRevenue: 4 },
      wizard_step: 7,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "project_id" }
  );

  console.log(`Running generation pipeline for sample project ${projectId}...`);
  await runGenerationPipeline(projectId, userId);
  console.log(`Done. Sample project ready at /ventures/${projectId}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
