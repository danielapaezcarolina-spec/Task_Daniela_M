"use client";

import { useState } from "react";
import { useTasks } from "@/context/task-context";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { TaskActionDialog } from "@/components/popups/task-action-dialog";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

const priorityStyles = {
  high: "bg-violet-100 text-violet-700",
  medium: "bg-violet-50 text-violet-600",
  low: "bg-violet-50/50 text-violet-500",
};

const priorityLabels = {
  high: "Urgente",
  medium: "Media",
  low: "Baja",
};

export function RecentTasks() {
  const { tasks, updateTaskStatus, addObservation, updateTask } = useTasks();
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const recentTasks = tasks
    .filter((t) => t.status !== "done")
    .slice(0, 5);

  const handleChangeStatus = (taskId: string, status: Task["status"], obs?: string) => {
    updateTaskStatus(taskId, status, obs);
    setTaskToComplete(null);
  };

  return (
    <>
      <div className="rounded-2xl bg-card p-3 sm:p-4 shadow-sm border border-border/50">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-[11px] sm:text-xs font-semibold text-foreground">
            Tareas pendientes
          </h3>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">
            {recentTasks.length} pendientes
          </span>
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          {recentTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-start gap-2 rounded-lg p-2 hover:bg-muted/50 transition-colors group"
            >
              <Checkbox
                className="mt-0.5 rounded-md border-violet-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                onCheckedChange={(checked) => {
                  if (checked) setTaskToComplete(task);
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] sm:text-xs font-medium text-foreground truncate">
                  {task.title}
                </p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
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

      <TaskActionDialog
        task={taskToComplete}
        open={!!taskToComplete}
        onClose={() => setTaskToComplete(null)}
        onChangeStatus={handleChangeStatus}
        onAddObservation={(taskId, text) => {
          addObservation(taskId, text);
          setTaskToComplete(null);
        }}
        onEditTask={(taskId, updates) => {
          updateTask(taskId, updates);
          setTaskToComplete(null);
        }}
      />
    </>
  );
}
