"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { businessModelSchema } from "@/lib/validation/wizard";
import type { BusinessModelInput } from "@/types/venture";
import { StepFooter } from "./step-footer";

const BUSINESS_TYPES: { value: BusinessModelInput["businessType"]; label: string }[] = [
  { value: "service", label: "Service Business" },
  { value: "ecommerce", label: "Ecommerce" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "rental", label: "Rental" },
  { value: "construction", label: "Construction" },
  { value: "professional_services", label: "Professional Services" },
  { value: "software", label: "Software" },
  { value: "marketplace", label: "Marketplace" },
  { value: "subscription", label: "Subscription" },
  { value: "other", label: "Other" },
];

export function StepBusinessModel({
  defaultValue,
  pending,
  onBack,
  onSubmit,
}: {
  defaultValue: Partial<BusinessModelInput>;
  pending: boolean;
  onBack: () => void;
  onSubmit: (value: BusinessModelInput) => void;
}) {
  const [form, setForm] = useState({
    industry: defaultValue.industry || "",
    businessType: defaultValue.businessType || "service",
  });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = businessModelSchema.safeParse(form);
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
        <CardTitle>What kind of business is this?</CardTitle>
        <CardDescription>This shapes which financial and operational model we build.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input
              placeholder="e.g. Pressure Washing, Landscaping, Ecommerce"
              value={form.industry}
              onChange={(e) => setForm({ ...form, industry: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Business Type</Label>
            <Select
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value as BusinessModelInput["businessType"] })}
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
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
