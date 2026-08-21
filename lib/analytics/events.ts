export type AnalyticsEvent =
  | "landing_page_view"
  | "signup_started"
  | "signup_completed"
  | "analysis_started"
  | "analysis_completed"
  | "checkout_started"
  | "purchase_completed"
  | "subscription_started"
  | "pdf_exported"
  | "xlsx_exported"
  | "venture_created"
  | "ai_question_asked";

export type AnalyticsProperties = Record<string, string | number | boolean | undefined>;
