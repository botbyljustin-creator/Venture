import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { VentureCard } from "@/components/dashboard/venture-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "My Ventures" };

export default async function VenturesPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const list = projects || [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My Ventures</h1>
        <Link href="/ventures/new" className={buttonVariants()}>
          <PlusCircle className="h-4 w-4" />
          New Analysis
        </Link>
      </div>
      {list.length === 0 ? (
        <Card className="mt-6">
          <CardContent className="p-12 text-center text-muted-foreground">No ventures yet.</CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {list.map((project) => (
            <VentureCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
