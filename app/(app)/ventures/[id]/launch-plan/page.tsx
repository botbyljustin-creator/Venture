import { getProjectBundle } from "@/lib/projects/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LaunchTaskItem } from "@/components/project/launch-task-item";

const WEEK_LABELS: Record<number, string> = {
  1: "Week 1 — Foundation",
  2: "Week 2 — Build",
  3: "Week 3 — Customer Acquisition",
  4: "Week 4 — Launch",
};

export default async function LaunchPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { launchTasks } = await getProjectBundle(id);

  if (!launchTasks.length) return <p className="text-muted-foreground">Launch plan not available yet.</p>;

  const done = launchTasks.filter((t) => t.status === "done").length;
  const progress = Math.round((done / launchTasks.length) * 100);

  const byWeek = new Map<number, typeof launchTasks>();
  for (const t of launchTasks) {
    if (!byWeek.has(t.week)) byWeek.set(t.week, []);
    byWeek.get(t.week)!.push(t);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Launch Progress</span>
            <span className="text-muted-foreground">{done} of {launchTasks.length} tasks complete</span>
          </div>
          <Progress value={progress} />
        </CardContent>
      </Card>

      {[1, 2, 3, 4].map((week) => {
        const tasks = byWeek.get(week);
        if (!tasks) return null;
        return (
          <Card key={week}>
            <CardHeader><CardTitle className="text-base">{WEEK_LABELS[week]}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <LaunchTaskItem key={t.id} task={t} projectId={id} />
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
