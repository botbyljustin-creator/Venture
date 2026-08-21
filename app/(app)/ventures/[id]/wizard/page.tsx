import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { WizardShell, type WizardInitialData } from "@/components/wizard/wizard-shell";
import { defaultPreferences } from "@/lib/validation/wizard";

export const metadata = { title: "New Venture Analysis" };

export default async function WizardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("id, user_id").eq("id", id).single();
  if (!project || project.user_id !== user.id) notFound();

  const { data: inputs } = await supabase.from("project_inputs").select("*").eq("project_id", id).single();

  const initialData: WizardInitialData = {
    businessIdea: inputs?.business_idea || "",
    location: (inputs?.location as unknown as WizardInitialData["location"]) || {},
    businessModel: (inputs?.business_model as unknown as WizardInitialData["businessModel"]) || {},
    ownerGoals: (inputs?.owner_goals as unknown as WizardInitialData["ownerGoals"]) || {},
    capital: (inputs?.capital as unknown as WizardInitialData["capital"]) || {},
    experience: (inputs?.experience as unknown as WizardInitialData["experience"]) || {},
    preferences: (inputs?.preferences as unknown as WizardInitialData["preferences"]) || defaultPreferences,
  };

  return <WizardShell projectId={id} initialStep={inputs?.wizard_step || 1} initialData={initialData} />;
}
