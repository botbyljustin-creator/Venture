"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProjectAction, duplicateProjectAction } from "@/lib/projects/actions";
import { Button } from "@/components/ui/button";

export function VentureCardActions({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this venture? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteProjectAction(projectId);
      toast.success("Venture deleted");
      router.refresh();
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      await duplicateProjectAction(projectId);
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" disabled={isPending} onClick={handleDuplicate}>
        Duplicate
      </Button>
      <Button variant="ghost" size="sm" disabled={isPending} onClick={handleDelete} className="text-danger hover:text-danger">
        Delete
      </Button>
    </div>
  );
}
