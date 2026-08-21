"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capitalSchema } from "@/lib/validation/wizard";
import type { CapitalInput } from "@/types/venture";
import { cn } from "@/lib/utils";
import { StepFooter } from "./step-footer";

const BANDS: { value: CapitalInput["band"]; label: string }[] = [
  { value: "under_5k", label: "Under $5,000" },
  { value: "5k_10k", label: "$5,000–$10,000" },
  { value: "10k_25k", label: "$10,000–$25,000" },
  { value: "25k_50k", label: "$25,000–$50,000" },
  { value: "50k_100k", label: "$50,000–$100,000" },
  { value: "100k_plus", label: "$100,000+" },
];

export function StepCapital({
  defaultValue,
  pending,
  onBack,
  onSubmit,
}: {
  defaultValue: Partial<CapitalInput>;
  pending: boolean;
  onBack: () => void;
  onSubmit: (value: CapitalInput) => void;
}) {
  const [band, setBand] = useState<CapitalInput["band"]>(defaultValue.band || "10k_25k");
  const [customAmount, setCustomAmount] = useState<string>(defaultValue.customAmount ? String(defaultValue.customAmount) : "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = capitalSchema.safeParse({ band, customAmount: customAmount ? Number(customAmount) : undefined });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please select an amount");
      return;
    }
    setError(null);
    onSubmit(parsed.data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>How much startup capital is available?</CardTitle>
        <CardDescription>This keeps recommendations realistic for your budget.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {BANDS.map((b) => (
              <button
                type="button"
                key={b.value}
                onClick={() => setBand(b.value)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors",
                  band === b.value ? "border-primary bg-accent text-accent-foreground" : "border-border hover:bg-muted"
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Or enter a custom amount (optional)</Label>
            <Input type="number" min={0} placeholder="$" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <StepFooter pending={pending} onBack={onBack} />
        </form>
      </CardContent>
    </Card>
  );
}
