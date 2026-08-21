import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { GenerationProgress } from "@/components/project/generation-progress";

export const metadata = { title: "Generating Your Analysis" };

export default async function GeneratingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase.from("projects").select("id, user_id, status").eq("id", id).single();
  if (!project || project.user_id !== user.id) notFound();

  return <GenerationProgress projectId={id} />;
}
