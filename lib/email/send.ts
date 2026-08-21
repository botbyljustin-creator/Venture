import { getEmailProvider } from "./provider";
import {
  welcomeEmail,
  analysisCompleteEmail,
  purchaseReceiptEmail,
  subscriptionStartedEmail,
  subscriptionCanceledEmail,
  paymentFailedEmail,
} from "./templates";

const provider = getEmailProvider();

export async function sendWelcomeEmail(to: string, name: string) {
  const { subject, html } = welcomeEmail(name);
  await provider.send({ to, subject, html }).catch((err) => console.error("[email] welcome failed", err));
}

export async function sendAnalysisCompleteEmail(to: string, ventureName: string, projectId: string, score: number) {
  const { subject, html } = analysisCompleteEmail(ventureName, projectId, score);
  await provider.send({ to, subject, html }).catch((err) => console.error("[email] analysis complete failed", err));
}

export async function sendPurchaseReceiptEmail(to: string, plan: string, amountCents: number) {
  const { subject, html } = purchaseReceiptEmail(plan, amountCents);
  await provider.send({ to, subject, html }).catch((err) => console.error("[email] receipt failed", err));
}

export async function sendSubscriptionStartedEmail(to: string, plan: string) {
  const { subject, html } = subscriptionStartedEmail(plan);
  await provider.send({ to, subject, html }).catch((err) => console.error("[email] subscription started failed", err));
}

export async function sendSubscriptionCanceledEmail(to: string) {
  const { subject, html } = subscriptionCanceledEmail();
  await provider.send({ to, subject, html }).catch((err) => console.error("[email] subscription canceled failed", err));
}

export async function sendPaymentFailedEmail(to: string) {
  const { subject, html } = paymentFailedEmail();
  await provider.send({ to, subject, html }).catch((err) => console.error("[email] payment failed notice failed", err));
}
