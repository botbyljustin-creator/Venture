"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { PreferencesInput } from "@/types/venture";
import { StepFooter } from "./step-footer";

const FIELDS: { key: keyof PreferencesInput; label: string }[] = [
  { key: "cashFlow", label: "Cash Flow" },
  { key: "scalability", label: "Scalability" },
  { key: "flexibility", label: "Flexibility" },
  { key: "passivePotential", label: "Passive Potential" },
  { key: "lowStartupCost", label: "Low Startup Cost" },
  { key: "highProfitMargin", label: "High Profit Margin" },
  { key: "recurringRevenue", label: "Recurring Revenue" },
  { key: "exitPotential", label: "Exit Potential" },
];

export function StepPreferences({
  defaultValue,
  pending,
  onBack,
  onSubmit,
}: {
  defaultValue: PreferencesInput;
  pending: boolean;
  onBack: () => void;
  onSubmit: (value: PreferencesInput) => void;
}) {
  const [form, setForm] = useState<PreferencesInput>(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What matters most to you?</CardTitle>
        <CardDescription>Rate each from 1 (not important) to 5 (very important).</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{f.label}</Label>
                <span className="font-tabular text-sm font-medium">{form[f.key]}</span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })}
              />
            </div>
          ))}
          <StepFooter pending={pending} onBack={onBack} nextLabel="Generate My Analysis" />
        </form>
      </CardContent>
    </Card>
  );
}
