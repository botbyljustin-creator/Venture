"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { PlanId } from "@/config/pricing";

export function CheckoutButton({
  plan,
  projectId,
  children,
  ...buttonProps
}: { plan: Exclude<PlanId, "free">; projectId?: string; children: React.ReactNode } & ButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, projectId }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Failed to start checkout");
        setLoading(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      toast.error("Network error starting checkout");
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} {...buttonProps}>
      {loading ? "Redirecting…" : children}
    </Button>
  );
}
