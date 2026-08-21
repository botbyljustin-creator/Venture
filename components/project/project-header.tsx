import { Badge } from "@/components/ui/badge";
import { getProjectStatusInfo } from "@/lib/projects/status";
import type { ProjectBundle } from "@/lib/projects/data";

export function ProjectHeader({ project }: { project: ProjectBundle["project"] }) {
  const statusInfo = getProjectStatusInfo(project.status, project.venture_score);
  return (
    <div className="border-b border-border bg-background px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {[project.industry, project.city && project.region ? `${project.city}, ${project.region}` : null]
            .filter(Boolean)
            .join(" · ") || "Complete the wizard to generate your analysis"}
        </p>
      </div>
    </div>
  );
}
