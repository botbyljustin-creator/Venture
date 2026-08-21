import { getStripeClient } from "./client";
import { getOrCreateStripeCustomerId } from "./customer";
import { getPlan, type PlanId } from "@/config/pricing";
import { appConfig } from "@/config/app";

const PRICE_ENV: Record<Exclude<PlanId, "free">, string | undefined> = {
  launch: process.env.STRIPE_LAUNCH_PRICE_ID,
  pro: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
};

export async function createCheckoutSessionUrl(opts: {
  userId: string;
  email: string;
  plan: Exclude<PlanId, "free">;
  projectId?: string;
}): Promise<string> {
  const priceId = PRICE_ENV[opts.plan];
  if (!priceId) {
    throw new Error(
      `Missing Stripe price ID for plan "${opts.plan}". Set the corresponding STRIPE_*_PRICE_ID environment variable.`
    );
  }

  const stripe = getStripeClient();
  const customerId = await getOrCreateStripeCustomerId(opts.userId, opts.email);
  const plan = getPlan(opts.plan);
  const isSubscription = plan.interval === "month" || plan.interval === "year";

  const successPath = opts.projectId ? `/ventures/${opts.projectId}?checkout=success` : "/account/billing?checkout=success";
  const cancelPath = opts.projectId ? `/ventures/${opts.projectId}/export?checkout=cancelled` : "/pricing?checkout=cancelled";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: isSubscription ? "subscription" : "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appConfig.url}${successPath}`,
    cancel_url: `${appConfig.url}${cancelPath}`,
    metadata: {
      userId: opts.userId,
      plan: opts.plan,
      ...(opts.projectId ? { projectId: opts.projectId } : {}),
    },
    subscription_data: isSubscription ? { metadata: { userId: opts.userId, plan: opts.plan } } : undefined,
    payment_intent_data: !isSubscription
      ? { metadata: { userId: opts.userId, plan: opts.plan, ...(opts.projectId ? { projectId: opts.projectId } : {}) } }
      : undefined,
  });

  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export async function createBillingPortalUrl(customerId: string): Promise<string> {
  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appConfig.url}/account/billing`,
  });
  return session.url;
}
