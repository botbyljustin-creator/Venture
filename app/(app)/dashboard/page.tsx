import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { VentureCard } from "@/components/dashboard/venture-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const list = projects || [];
  const readyProjects = list.filter((p) => p.status === "ready");
  const avgScore = readyProjects.length
    ? Math.round(readyProjects.reduce((sum, p) => sum + (p.venture_score || 0), 0) / readyProjects.length)
    : null;
  const bestVenture = readyProjects.sort((a, b) => (b.venture_score || 0) - (a.venture_score || 0))[0];

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName}</h1>
          <p className="mt-1 text-muted-foreground">Here&apos;s where your ventures stand.</p>
        </div>
        <Link href="/ventures/new" className={buttonVariants()}>
          <PlusCircle className="h-4 w-4" />
          New Business Analysis
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Saved Ventures</p>
            <p className="mt-2 text-3xl font-semibold font-tabular">{list.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Average Venture Score</p>
            <p className="mt-2 text-3xl font-semibold font-tabular">{avgScore !== null ? `${avgScore}/100` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Best Year 1 Revenue Potential</p>
            <p className="mt-2 text-3xl font-semibold font-tabular">
              {bestVenture ? formatCurrency(bestVenture.year1_revenue || 0, { compact: true }) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Your Ventures</h2>
        {list.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <p className="text-muted-foreground">You haven&apos;t analyzed a business idea yet.</p>
              <Link href="/ventures/new" className={buttonVariants()}>
                Analyze My First Business Idea
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {list.map((project) => (
              <VentureCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
