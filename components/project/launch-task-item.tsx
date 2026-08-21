"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toggleLaunchTaskAction } from "@/lib/projects/launch-tasks";
import type { Database } from "@/types/database";

type LaunchTask = Database["public"]["Tables"]["launch_tasks"]["Row"];

export function LaunchTaskItem({ task, projectId }: { task: LaunchTask; projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const done = task.status === "done";

  function toggle() {
    startTransition(() => toggleLaunchTaskAction(task.id, projectId, !done));
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border p-3">
      <input
        type="checkbox"
        checked={done}
        disabled={isPending}
        onChange={toggle}
        className="h-4 w-4 flex-shrink-0 rounded accent-[var(--primary)]"
      />
      <span className={cn("flex-1 text-sm", done && "text-muted-foreground line-through")}>{task.task}</span>
      {task.estimated_time && <span className="hidden text-xs text-muted-foreground sm:inline">{task.estimated_time}</span>}
      <Badge variant={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "secondary"}>
        {task.priority}
      </Badge>
    </li>
  );
}
