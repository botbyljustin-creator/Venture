import { appConfig } from "@/config/app";

function layout(bodyHtml: string, ctaHref?: string, ctaLabel?: string): string {
  return `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0f1115;">
    <p style="font-size: 18px; font-weight: 600; margin-bottom: 24px;">${appConfig.name}</p>
    <div style="font-size: 14px; line-height: 1.6;">${bodyHtml}</div>
    ${
      ctaHref && ctaLabel
        ? `<a href="${ctaHref}" style="display:inline-block;margin-top:24px;padding:10px 20px;background:#4338ca;color:#ffffff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">${ctaLabel}</a>`
        : ""
    }
    <p style="margin-top:40px;font-size:11px;color:#94a3b8;">${appConfig.disclaimer}</p>
  </div>`;
}

export function welcomeEmail(name: string) {
  return {
    subject: `Welcome to ${appConfig.name}`,
    html: layout(
      `<p>Hi ${name},</p><p>Welcome to ${appConfig.name}. You're ready to turn your first business idea into a full launch plan.</p>`,
      `${appConfig.url}/ventures/new`,
      "Analyze My Business Idea"
    ),
  };
}

export function analysisCompleteEmail(ventureName: string, projectId: string, score: number) {
  return {
    subject: `Your ${ventureName} analysis is ready`,
    html: layout(
      `<p>Your Venture Score for <strong>${ventureName}</strong> is <strong>${score}/100</strong>.</p><p>View your full financial model, pricing, and launch plan now.</p>`,
      `${appConfig.url}/ventures/${projectId}`,
      "View Report"
    ),
  };
}

export function purchaseReceiptEmail(plan: string, amountCents: number) {
  return {
    subject: `Your ${appConfig.name} receipt`,
    html: layout(
      `<p>Thanks for your purchase.</p><p>Plan: <strong>${plan}</strong><br/>Amount: <strong>$${(amountCents / 100).toFixed(2)}</strong></p>`,
      `${appConfig.url}/account/billing`,
      "View Billing"
    ),
  };
}

export function subscriptionStartedEmail(plan: string) {
  return {
    subject: `You're on ${appConfig.name} ${plan}`,
    html: layout(`<p>Your <strong>${plan}</strong> subscription is active. You now have unlimited ventures, exports, and the AI Advisor.</p>`),
  };
}

export function subscriptionCanceledEmail() {
  return {
    subject: `Your ${appConfig.name} subscription was canceled`,
    html: layout(`<p>Your subscription has been canceled. You'll keep access until the end of your current billing period.</p>`, `${appConfig.url}/pricing`, "Resubscribe"),
  };
}

export function paymentFailedEmail() {
  return {
    subject: `Action needed: payment failed`,
    html: layout(`<p>We couldn't process your latest payment. Please update your payment method to keep your Pro access.</p>`, `${appConfig.url}/account/billing`, "Update Payment Method"),
  };
}
