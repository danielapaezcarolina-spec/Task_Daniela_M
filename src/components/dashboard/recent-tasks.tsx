"use client";

import { useState } from "react";
import { useTasks } from "@/context/task-context";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CompleteTaskDialog } from "@/components/popups/complete-task-dialog";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/mock-data";

const priorityStyles = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-emerald-50 text-emerald-700",
};

const priorityLabels = {
  high: "Urgente",
  medium: "Media",
  low: "Baja",
};

export function RecentTasks() {
  const { tasks, completeTask } = useTasks();
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const recentTasks = tasks
    .filter((t) => t.status !== "done")
    .slice(0, 5);

  const handleConfirm = (taskId: string, comment: string) => {
    completeTask(taskId, comment);
    setTaskToComplete(null);
  };

  return (
    <>
      <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-sm border border-border/50">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-semibold text-foreground">
            Tareas pendientes
          </h3>
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {recentTasks.length} pendientes
          </span>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2.5 sm:gap-3 rounded-xl p-2.5 sm:p-3 hover:bg-muted/50 transition-colors group"
            >
              <Checkbox
                className="mt-0.5 rounded-md border-violet-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                onCheckedChange={(checked) => {
                  if (checked) setTaskToComplete(task);
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                  {task.title}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {task.companyName}
                </p>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[9px] sm:text-[10px] border-0 rounded-lg shrink-0 px-1.5",
                  priorityStyles[task.priority]
                )}
              >
                {priorityLabels[task.priority]}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <CompleteTaskDialog
        task={taskToComplete}
        open={!!taskToComplete}
        onClose={() => setTaskToComplete(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
