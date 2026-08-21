import { getStripeClient } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getOrCreateStripeCustomerId(userId: string, email: string): Promise<string> {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("stripe_customer_id").eq("id", userId).single();

  if (profile?.stripe_customer_id) return profile.stripe_customer_id;

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({ email, metadata: { userId } });

  await admin.from("profiles").update({ stripe_customer_id: customer.id }).eq("id", userId);
  return customer.id;
}
