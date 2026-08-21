"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { experienceSchema } from "@/lib/validation/wizard";
import type { ExperienceInput } from "@/types/venture";
import { StepFooter } from "./step-footer";

const FIELDS: { key: keyof ExperienceInput; label: string; placeholder: string }[] = [
  { key: "industryExperience", label: "Industry experience", placeholder: "e.g. 3 years working for a landscaping company" },
  { key: "salesExperience", label: "Sales experience", placeholder: "e.g. None, or 5 years in B2B sales" },
  { key: "managementExperience", label: "Management experience", placeholder: "e.g. Managed a crew of 4" },
  { key: "existingEquipment", label: "Existing equipment / resources", placeholder: "e.g. Pickup truck, basic tools" },
  { key: "existingNetwork", label: "Existing customers / network", placeholder: "e.g. A few contractor contacts" },
];

export function StepExperience({
  defaultValue,
  pending,
  onBack,
  onSubmit,
}: {
  defaultValue: Partial<ExperienceInput>;
  pending: boolean;
  onBack: () => void;
  onSubmit: (value: ExperienceInput) => void;
}) {
  const [form, setForm] = useState<ExperienceInput>({
    industryExperience: defaultValue.industryExperience || "",
    salesExperience: defaultValue.salesExperience || "",
    managementExperience: defaultValue.managementExperience || "",
    existingEquipment: defaultValue.existingEquipment || "",
    existingNetwork: defaultValue.existingNetwork || "",
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = experienceSchema.safeParse(form);
    onSubmit(parsed.success ? parsed.data : form);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>What experience do you bring?</CardTitle>
        <CardDescription>Optional, but it sharpens the operations and risk analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              <Textarea
                rows={2}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              />
            </div>
          ))}
          <StepFooter pending={pending} onBack={onBack} />
        </form>
      </CardContent>
    </Card>
  );
}
