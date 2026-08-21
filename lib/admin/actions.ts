"use server";

import { revalidatePath } from "next/cache";
import { requireUser, isAdminUser } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const user = await requireUser();
  const admin = await isAdminUser(user.id);
  if (!admin) throw new Error("Forbidden");
  return user;
}

export async function toggleUserDisabledAction(userId: string, disabled: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("profiles").update({ disabled }).eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function setUserAdminAction(userId: string, isAdminFlag: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("profiles").update({ is_admin: isAdminFlag }).eq("id", userId);
  revalidatePath(`/admin/users/${userId}`);
}

/** Grants Pro access without a real Stripe subscription (comps, support cases). */
export async function grantManualProAction(userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", userId).single();

  await admin.from("subscriptions").insert({
    user_id: userId,
    stripe_customer_id: profile?.stripe_customer_id || "manual",
    stripe_subscription_id: null,
    plan: "pro",
    status: "active",
    cancel_at_period_end: false,
  });
  revalidatePath(`/admin/users/${userId}`);
}

export async function revokeManualProAction(subscriptionId: string, userId: string) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from("subscriptions").update({ status: "canceled" }).eq("id", subscriptionId);
  revalidatePath(`/admin/users/${userId}`);
}
