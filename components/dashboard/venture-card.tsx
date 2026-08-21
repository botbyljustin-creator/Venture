import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/shared/score-gauge";
import { VentureCardActions } from "@/components/dashboard/venture-card-actions";
import { getProjectStatusInfo } from "@/lib/projects/status";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/types/database";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export function VentureCard({ project }: { project: ProjectRow }) {
  const statusInfo = getProjectStatusInfo(project.status, project.venture_score);
  const href = project.status === "draft" ? `/ventures/${project.id}/wizard` : project.status === "generating" ? `/ventures/${project.id}/generating` : `/ventures/${project.id}`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <Link href={href} className="font-semibold hover:underline">
            {project.name}
          </Link>
          <p className="text-sm text-muted-foreground">
            {project.city ? `${project.city}, ${project.region}` : project.industry || "Details pending"}
          </p>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </CardHeader>
      <CardContent>
        {project.status === "ready" && project.venture_score !== null ? (
          <div className="flex items-center gap-6">
            <ScoreGauge score={project.venture_score} size={72} />
            <div className="grid flex-1 grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Startup Cost</p>
                <p className="font-tabular font-semibold">{formatCurrency(project.startup_cost || 0, { compact: true })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Year 1 Revenue</p>
                <p className="font-tabular font-semibold">{formatCurrency(project.year1_revenue || 0, { compact: true })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Year 1 Profit</p>
                <p className="font-tabular font-semibold">{formatCurrency(project.year1_profit || 0, { compact: true })}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {project.status === "draft" && "Continue the setup wizard to generate your analysis."}
            {project.status === "generating" && "Your analysis is being generated…"}
            {project.status === "error" && "Something went wrong generating this venture. Try again."}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <Link href={href} className="text-sm font-medium text-primary hover:underline">
            {project.status === "ready" ? "View Report" : "Continue"}
          </Link>
          <VentureCardActions projectId={project.id} />
        </div>
      </CardContent>
    </Card>
  );
}
