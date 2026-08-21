"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionResult } from "@/lib/auth/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: ActionResult = {};

export function ProfileForm({ fullName, email }: { fullName: string; email: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} required />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Profile updated.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Changes"}
      </Button>
    </form>
  );
}
