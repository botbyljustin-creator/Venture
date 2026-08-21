"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  toggleUserDisabledAction,
  setUserAdminAction,
  grantManualProAction,
  revokeManualProAction,
} from "@/lib/admin/actions";

export function UserActions({
  userId,
  disabled,
  isAdmin,
  activeManualSubscriptionId,
}: {
  userId: string;
  disabled: boolean;
  isAdmin: boolean;
  activeManualSubscriptionId?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<void>, message: string) {
    startTransition(async () => {
      await action();
      toast.success(message);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => run(() => toggleUserDisabledAction(userId, !disabled), disabled ? "User re-enabled" : "User disabled")}
      >
        {disabled ? "Enable Account" : "Disable Account"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => run(() => setUserAdminAction(userId, !isAdmin), isAdmin ? "Admin access revoked" : "Admin access granted")}
      >
        {isAdmin ? "Revoke Admin" : "Make Admin"}
      </Button>
      {activeManualSubscriptionId ? (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => revokeManualProAction(activeManualSubscriptionId, userId), "Pro access revoked")}
        >
          Revoke Pro Access
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => grantManualProAction(userId), "Pro access granted")}
        >
          Grant Pro Access
        </Button>
      )}
    </div>
  );
}
