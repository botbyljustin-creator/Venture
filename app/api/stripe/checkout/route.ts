import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSessionUrl } from "@/lib/stripe/checkout";
import type { PlanId } from "@/config/pricing";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { plan, projectId } = (await request.json()) as { plan: PlanId; projectId?: string };
  if (plan === "free") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  if (projectId) {
    const { data: project } = await supabase.from("projects").select("user_id").eq("id", projectId).single();
    if (!project || project.user_id !== user.id) {
      return NextResponse.json({ error: "Venture not found" }, { status: 404 });
    }
  }

  try {
    const url = await createCheckoutSessionUrl({ userId: user.id, email: user.email, plan, projectId });
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
