export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailProvider {
  send(input: SendEmailInput): Promise<void>;
}

/**
 * Provider-agnostic email sending. Swap the Resend adapter for another
 * provider by implementing EmailProvider and changing this factory — no
 * call site elsewhere in the app needs to change.
 */
export function getEmailProvider(): EmailProvider {
  return {
    async send(input) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        console.warn(`[email] RESEND_API_KEY not set — skipping email "${input.subject}" to ${input.to}`);
        return;
      }
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const from = process.env.EMAIL_FROM || "VentureForge <noreply@ventureforge.app>";
      await resend.emails.send({ from, to: input.to, subject: input.subject, html: input.html, text: input.text });
    },
  };
}
