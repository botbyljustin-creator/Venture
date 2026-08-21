import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { getProjectBundle } from "@/lib/projects/data";
import { projectHasFullAccess } from "@/lib/permissions/entitlements";
import { AdvisorChat } from "@/components/project/advisor-chat";
import { UpgradeBanner } from "@/components/project/upgrade-banner";

export default async function AdvisorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const { project } = await getProjectBundle(id);
  const hasAccess = await projectHasFullAccess(project.entitlement, user.id);

  if (!hasAccess) {
    return <UpgradeBanner feature="the AI Advisor" projectId={id} />;
  }

  const supabase = await createClient();
  const { data: history } = await supabase
    .from("ai_chat_messages")
    .select("role, content")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  return (
    <AdvisorChat
      projectId={id}
      initialMessages={(history || []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))}
    />
  );
}
