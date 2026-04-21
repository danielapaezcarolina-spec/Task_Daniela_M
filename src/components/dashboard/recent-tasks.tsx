"use client";

import { useState } from "react";
import { useTasks } from "@/context/task-context";
import { useReminders } from "@/context/reminder-context";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, X } from "lucide-react";
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

export function RecentTasks({ stretch }: { stretch?: boolean }) {
  const { tasks, updateTaskStatus, addObservation, updateTask, deleteTask } = useTasks();
  const { reminders, dismissReminder } = useReminders();
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const recentTasks = tasks
    .filter((t) => t.status !== "done" && t.dueDate && t.dueDate.split("T")[0] === today)
    .slice(0, 4);

  const handleChangeStatus = (taskId: string, status: Task["status"], obs?: string) => {
    updateTaskStatus(taskId, status, obs);
    setTaskToComplete(null);
  };

  return (
    <div className={cn(stretch && "flex-1 min-h-0 flex flex-col")}>
      <div className={cn("rounded-2xl bg-card p-3 sm:p-4 shadow-sm border border-border/50", stretch && "flex-1 min-h-0 flex flex-col overflow-hidden")}>
        <div className="flex items-center justify-between mb-2 sm:mb-3 shrink-0">
          <h3 className="text-[11px] sm:text-xs font-semibold text-foreground">
            Tareas pendientes
          </h3>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground">
            {recentTasks.length} pendientes
          </span>
        </div>

        <div className={cn("space-y-1 sm:space-y-1.5", stretch && "flex-1 min-h-0 overflow-y-auto")}>
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
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                    {task.companyName}
                  </p>
                  {(() => {
                    const taskReminder = reminders.find((r) => r.taskId === task.id && r.status === "pending");
                    if (!taskReminder) return null;
                    return (
                      <span className="group/pill text-[9px] font-medium px-1 py-0.5 rounded-md bg-blue-50 text-blue-600 flex items-center gap-0.5 shrink-0">
                        <Bell className="h-2 w-2" />
                        {new Date(taskReminder.scheduledTime).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissReminder(taskReminder.id);
                          }}
                          className="ml-0.5 opacity-0 group-hover/pill:opacity-100 transition-opacity hover:bg-blue-200/50 rounded-full p-0.5"
                          title="Cancelar recordatorio"
                        >
                          <X className="h-2 w-2" />
                        </button>
                      </span>
                    );
                  })()}
                </div>
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
        onDeleteTask={(taskId) => {
          deleteTask(taskId);
          setTaskToComplete(null);
        }}
      />
    </div>
  );
}
