"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";
import type { AnalyticsEvent, AnalyticsProperties } from "@/lib/analytics/events";

export function TrackOnMount({ event, properties }: { event: AnalyticsEvent; properties?: AnalyticsProperties }) {
  useEffect(() => {
    track(event, properties);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
