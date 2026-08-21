"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GENERATION_STEPS, type GenerationStatus } from "@/lib/generation/steps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/track";

export function GenerationProgress({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<GenerationStatus>({ currentStep: "classification", completedSteps: [] });
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    track("analysis_started", { projectId });

    fetch(`/api/projects/${projectId}/generate`, { method: "POST" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setError(body.error || "Generation failed. Please try again.");
        }
      })
      .catch(() => setError("Network error while starting generation."));
  }, [projectId]);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function poll() {
      const { data } = await supabase
        .from("projects")
        .select("status, generation_status")
        .eq("id", projectId)
        .single();

      if (cancelled || !data) return;

      if (data.status === "ready") {
        track("analysis_completed", { projectId });
        router.push(`/ventures/${projectId}`);
        return;
      }
      if (data.status === "error") {
        const gs = data.generation_status as unknown as GenerationStatus;
        setError(gs?.error || "Generation failed. Please try again.");
        return;
      }
      setStatus(data.generation_status as unknown as GenerationStatus);
    }

    poll();
    const interval = setInterval(poll, 2500);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [projectId, router]);

  function retry() {
    setError(null);
    started.current = false;
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-20">
      <Card>
        <CardHeader>
          <CardTitle>Building your venture analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-danger/10 p-4 text-sm text-danger">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                {error}
              </div>
              <Button onClick={retry}>Try Again</Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {GENERATION_STEPS.map((step) => {
                const done = status.completedSteps?.includes(step.key);
                const active = status.currentStep === step.key;
                return (
                  <li key={step.key} className="flex items-center gap-3 text-sm">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : active ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/40" />
                    )}
                    <span className={cn(done ? "text-foreground" : active ? "font-medium text-foreground" : "text-muted-foreground")}>
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-6 text-xs text-muted-foreground">
            This usually takes 1-2 minutes. Feel free to keep this tab open.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
