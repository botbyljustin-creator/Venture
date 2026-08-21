"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PortalButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error || "Failed to open billing portal");
        setLoading(false);
        return;
      }
      window.location.href = body.url;
    } catch {
      toast.error("Network error opening billing portal");
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={loading}>
      {loading ? "Opening…" : "Manage Billing"}
    </Button>
  );
}
