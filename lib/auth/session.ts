import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Use in Server Components / Server Actions that require a logged-in user. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("disabled").eq("id", user.id).single();
  if (profile?.disabled) redirect("/account-suspended");

  return user;
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("email, is_admin").eq("id", userId).single();
  if (!data) return false;
  return data.is_admin || adminEmails.includes(data.email.toLowerCase());
}
