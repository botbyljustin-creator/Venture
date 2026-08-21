"use client";

import { useState, type FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { locationSchema } from "@/lib/validation/wizard";
import type { LocationInput } from "@/types/venture";
import { StepFooter } from "./step-footer";

export function StepLocation({
  defaultValue,
  pending,
  onBack,
  onSubmit,
}: {
  defaultValue: Partial<LocationInput>;
  pending: boolean;
  onBack: () => void;
  onSubmit: (value: LocationInput) => void;
}) {
  const [form, setForm] = useState({
    country: defaultValue.country || "United States",
    region: defaultValue.region || "",
    city: defaultValue.city || "",
    serviceRadius: defaultValue.serviceRadius || "",
    scope: defaultValue.scope || "local",
  });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = locationSchema.safeParse(form);
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
        <CardTitle>Where will you operate?</CardTitle>
        <CardDescription>Location drives realistic pricing, costs, and market context.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>State / Region</Label>
              <Input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Service Radius</Label>
              <Input
                placeholder="e.g. 20 miles"
                value={form.serviceRadius}
                onChange={(e) => setForm({ ...form, serviceRadius: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Business Scope</Label>
            <Select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as LocationInput["scope"] })}>
              <option value="local">Local Business</option>
              <option value="regional">Regional Business</option>
              <option value="national">National Business</option>
              <option value="online">Online Business</option>
            </Select>
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <StepFooter pending={pending} onBack={onBack} />
        </form>
      </CardContent>
    </Card>
  );
}
