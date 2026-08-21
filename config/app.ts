/**
 * Central branding/app configuration.
 * Change these values to rebrand the entire product without touching business logic.
 */
export const appConfig = {
  name: "VentureForge",
  shortName: "VentureForge",
  tagline: "Turn Any Business Idea Into a Launch Plan",
  description:
    "Analyze the opportunity, run the numbers, build your pricing, and generate a complete launch package in minutes.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  supportEmail: "support@ventureforge.app",
  legalEntityName: "VentureForge",
  disclaimer:
    "VentureForge provides estimates and educational business planning tools. Financial projections are based on assumptions and are not guarantees of future performance. Users should independently verify costs, regulations, licensing requirements, taxes, and market conditions.",
  social: {
    twitter: "",
    linkedin: "",
  },
} as const;

export type AppConfig = typeof appConfig;
