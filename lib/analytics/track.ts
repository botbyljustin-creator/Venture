"use client";

import type { AnalyticsEvent, AnalyticsProperties } from "./events";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    posthog?: { capture: (event: string, properties?: Record<string, unknown>) => void };
  }
}

/**
 * Provider-agnostic client-side event tracking. Fans out to whichever
 * providers are configured (GA4 via gtag, PostHog) — call sites never
 * import a specific analytics SDK, so swapping providers only touches
 * this file and components/analytics/analytics-scripts.tsx.
 */
export function track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
  if (typeof window === "undefined") return;

  try {
    window.gtag?.("event", event, properties);
    window.posthog?.capture(event, properties);
    if (process.env.NODE_ENV !== "production" && !window.gtag && !window.posthog) {
      console.debug(`[analytics] ${event}`, properties);
    }
  } catch (err) {
    console.error("[analytics] tracking failed", err);
  }
}
