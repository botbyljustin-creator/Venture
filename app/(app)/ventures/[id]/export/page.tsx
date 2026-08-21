import { requireUser } from "@/lib/auth/session";
import { getProjectBundle } from "@/lib/projects/data";
import { projectHasFullAccess } from "@/lib/permissions/entitlements";
import { UpgradeBanner } from "@/components/project/upgrade-banner";
import { ExportButtons } from "@/components/project/export-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ExportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const { project } = await getProjectBundle(id);
  const hasAccess = await projectHasFullAccess(project.entitlement, user.id);

  if (!hasAccess) {
    return <UpgradeBanner feature="PDF and Excel exports" projectId={id} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Report</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-muted-foreground">
          Download a structured, professional report — not a screenshot of the app. Includes your
          Venture Score, financial model, startup costs, pricing, marketing, operations, launch
          plan, and risk analysis.
        </p>
        <ExportButtons projectId={id} />
      </CardContent>
    </Card>
  );
}
