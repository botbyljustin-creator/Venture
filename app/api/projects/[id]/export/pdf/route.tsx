import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProjectBundle } from "@/lib/projects/data";
import { projectHasFullAccess } from "@/lib/permissions/entitlements";
import { VentureReportDocument } from "@/lib/pdf/venture-report";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Not authenticated", { status: 401 });

  const bundle = await getProjectBundle(id);
  if (bundle.project.user_id !== user.id) return new Response("Not found", { status: 404 });

  const hasAccess = await projectHasFullAccess(bundle.project.entitlement, user.id);
  if (!hasAccess) return new Response("Upgrade required", { status: 403 });

  const buffer = await renderToBuffer(<VentureReportDocument bundle={bundle} />);

  const admin = createAdminClient();
  await admin.from("exports").insert({ user_id: user.id, project_id: id, type: "pdf" });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slugify(bundle.project.name)}-venture-report.pdf"`,
    },
  });
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "venture";
}
