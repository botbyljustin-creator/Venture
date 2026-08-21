import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature || "", webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;
      const projectId = session.metadata?.projectId;

      if (session.mode === "payment" && userId && plan === "launch") {
        await admin.from("purchases").insert({
          user_id: userId,
          project_id: projectId || null,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          plan: "launch",
          amount_cents: session.amount_total || 0,
          status: "succeeded",
        });

        if (projectId) {
          await admin.from("projects").update({ entitlement: "launch" }).eq("id", projectId);
        }
      }
      break;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId || (await resolveUserIdFromCustomer(admin, subscription.customer as string));
      if (!userId) break;

      const plan = subscription.metadata?.plan === "pro_annual" ? "pro_annual" : "pro";
      const periodEndSec = (subscription as unknown as { current_period_end?: number }).current_period_end;

      await admin.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          plan,
          status: subscription.status,
          current_period_end: periodEndSec ? new Date(periodEndSec * 1000).toISOString() : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
        { onConflict: "stripe_subscription_id" }
      );
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await admin.from("subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", subscription.id);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as unknown as { subscription?: string }).subscription;
      if (subId) {
        await admin.from("subscriptions").update({ status: "past_due" }).eq("stripe_subscription_id", subId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

async function resolveUserIdFromCustomer(admin: ReturnType<typeof createAdminClient>, customerId: string): Promise<string | null> {
  const { data } = await admin.from("profiles").select("id").eq("stripe_customer_id", customerId).maybeSingle();
  return data?.id ?? null;
}
