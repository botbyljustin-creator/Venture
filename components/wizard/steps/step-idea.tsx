"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { businessIdeaSchema } from "@/lib/validation/wizard";

export function StepIdea({
  defaultValue,
  pending,
  onSubmit,
}: {
  defaultValue: string;
  pending: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue || "");
  const [error, setError] = useState<string | null>(null);

  function handleNext() {
    const parsed = businessIdeaSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please describe your idea");
      return;
    }
    setError(null);
    onSubmit(parsed.data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What business are you considering?</CardTitle>
        <CardDescription>Describe it in your own words — we&apos;ll ask smart follow-up questions next.</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          rows={6}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="I want to start a dumpster rental company serving residential contractors."
        />
        {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        <div className="mt-6 flex justify-end">
          <Button onClick={handleNext} disabled={pending}>
            {pending ? "Saving…" : "Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
