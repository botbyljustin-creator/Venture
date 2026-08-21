import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getProjectBundle } from "@/lib/projects/data";
import { ProjectHeader } from "@/components/project/project-header";
import { ProjectNav } from "@/components/project/project-nav";

export default async function VentureLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const { project } = await getProjectBundle(id);

  if (project.user_id !== user.id && !project.is_sample) {
    redirect("/dashboard");
  }
  if (project.status === "draft") redirect(`/ventures/${id}/wizard`);
  if (project.status === "generating") redirect(`/ventures/${id}/generating`);

  return (
    <div className="min-h-screen">
      <ProjectHeader project={project} />
      <ProjectNav projectId={id} />
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  );
}
