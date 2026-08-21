"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ownerGoalsSchema } from "@/lib/validation/wizard";
import type { OwnerGoalsInput } from "@/types/venture";
import { StepFooter } from "./step-footer";

const INVOLVEMENT_OPTIONS: { value: OwnerGoalsInput["involvement"]; label: string }[] = [
  { value: "owner_operator", label: "Owner Operator" },
  { value: "manage_small_team", label: "Manage a Small Team" },
  { value: "manager_run", label: "Build a Manager-Run Company" },
  { value: "mostly_passive", label: "Mostly Passive" },
  { value: "sell_eventually", label: "Sell Eventually" },
];

export function StepGoals({
  defaultValue,
  pending,
  onBack,
  onSubmit,
}: {
  defaultValue: Partial<OwnerGoalsInput>;
  pending: boolean;
  onBack: () => void;
  onSubmit: (value: OwnerGoalsInput) => void;
}) {
  const [form, setForm] = useState({
    targetAnnualIncome: defaultValue.targetAnnualIncome ?? 100000,
    targetAnnualRevenue: defaultValue.targetAnnualRevenue ?? 300000,
    desiredWeeklyHours: defaultValue.desiredWeeklyHours ?? 40,
    desiredEmployees: defaultValue.desiredEmployees ?? 1,
    involvement: defaultValue.involvement ?? "owner_operator",
  });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = ownerGoalsSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please complete all fields");
      return;
    }
    setError(null);
    onSubmit(parsed.data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What are your goals?</CardTitle>
        <CardDescription>We&apos;ll design the model around what you actually want out of this.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Target annual owner income</Label>
              <Input type="number" min={0} value={form.targetAnnualIncome} onChange={(e) => setForm({ ...form, targetAnnualIncome: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Target annual revenue</Label>
              <Input type="number" min={0} value={form.targetAnnualRevenue} onChange={(e) => setForm({ ...form, targetAnnualRevenue: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Desired weekly hours</Label>
              <Input type="number" min={0} max={168} value={form.desiredWeeklyHours} onChange={(e) => setForm({ ...form, desiredWeeklyHours: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Desired employees</Label>
              <Input type="number" min={0} value={form.desiredEmployees} onChange={(e) => setForm({ ...form, desiredEmployees: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Desired involvement</Label>
            <Select value={form.involvement} onChange={(e) => setForm({ ...form, involvement: e.target.value as OwnerGoalsInput["involvement"] })}>
              {INVOLVEMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <StepFooter pending={pending} onBack={onBack} />
        </form>
      </CardContent>
    </Card>
  );
}
