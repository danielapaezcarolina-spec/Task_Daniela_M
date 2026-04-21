"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/context/task-context";
import { TaskActionDialog } from "@/components/popups/task-action-dialog";
import {
  X,
  Sun,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

const priorityStyles: Record<string, string> = {
  high: "bg-violet-100 border-violet-200",
  medium: "bg-violet-50 border-violet-100",
  low: "bg-violet-50/50 border-violet-100/50",
};

const priorityDot: Record<string, string> = {
  high: "bg-violet-500",
  medium: "bg-violet-400",
  low: "bg-violet-300",
};

const statusIcons = {
  todo: { icon: Circle, color: "text-violet-300" },
  in_progress: { icon: Loader2, color: "text-violet-500" },
  done: { icon: CheckCircle2, color: "text-emerald-400" },
};

interface DailyTasksPopupProps {
  open: boolean;
  onClose: () => void;
}

export function DailyTasksPopup({ open, onClose }: DailyTasksPopupProps) {
  const router = useRouter();
  const { tasks, updateTaskStatus, addObservation, updateTask, deleteTask } = useTasks();
  const [visible, setVisible] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => setVisible(true), 50);
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const isWeekday = today.getDay() >= 1 && today.getDay() <= 5;

  const todayTasks = tasks.filter((t) => {
    if (t.status === "done") return false;
    const taskDate = t.dueDate?.split("T")[0];

    // Weekly tasks: show Mon-Fri
    if (t.recurrence === "weekly") return isWeekday;

    // Weekly specific: show only on the chosen day
    if (t.recurrence === "weekly_specific") return t.weekDay === today.getDay();

    // Daily tasks: show Mon-Fri
    if (t.recurrence === "daily") return isWeekday;

    // All other tasks: show on exact due date
    return taskDate === todayStr;
  });
  const urgentCount = todayTasks.filter((t) => t.priority === "high").length;

  const dayFormatted = today.toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const handleTaskClick = (companyId: string) => {
    onClose();
    router.push(`/empresas/${companyId}`);
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleStatusClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (task.status !== "done") {
      setTaskToComplete(task);
    }
  };

  const handleChangeStatus = (taskId: string, status: Task["status"], obs?: string) => {
    updateTaskStatus(taskId, status, obs);
    setTaskToComplete(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
            visible ? "opacity-100" : "opacity-0"
          )}
          onClick={handleClose}
        />

        {/* Popup */}
        <div
          className={cn(
            "relative w-full max-w-md rounded-3xl bg-card shadow-2xl shadow-violet-200/50 overflow-hidden transition-all duration-300",
            visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
          )}
        >
          {/* Header gradient */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 px-6 pt-6 pb-5 text-white relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Sun className="h-5 w-5 text-amber-300" />
              <span className="text-sm text-white/70">Buenos días</span>
            </div>

            <h2 className="text-2xl font-bold">
              Hola, Daniela
            </h2>
            <p className="text-sm text-white/70 mt-1 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span className="capitalize">{dayFormatted}</span>
            </p>

            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/15">
              <div>
                <p className="text-2xl font-bold">{todayTasks.length}</p>
                <p className="text-[11px] text-white/50">Tareas hoy</p>
              </div>
              {urgentCount > 0 && (
                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full">
                  <AlertCircle className="h-3.5 w-3.5 text-white/70" />
                  <span className="text-xs font-medium text-white/80">{urgentCount} urgente{urgentCount > 1 ? "s" : ""}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tasks list */}
          <div className="px-4 py-4 max-h-80 overflow-y-auto">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-3">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-foreground">No tienes tareas pendientes hoy</p>
                <p className="text-xs text-muted-foreground mt-1">Disfruta tu día libre</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
                  Tus tareas de hoy
                </p>
                {todayTasks.map((task) => {
                  const StatusIcon = statusIcons[task.status].icon;
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task.companyId || "")}
                      className={cn(
                        "w-full text-left rounded-2xl border p-3.5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group",
                        priorityStyles[task.priority]
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          onClick={(e) => handleStatusClick(e, task)}
                          className="shrink-0 hover:scale-110 transition-transform cursor-pointer"
                          title="Marcar como completada"
                          role="button"
                          tabIndex={0}
                        >
                          <StatusIcon
                            className={cn(
                              "h-5 w-5 mt-0.5",
                              statusIcons[task.status].color,
                              task.status === "in_progress" && "animate-spin"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-foreground leading-tight">
                              {task.title}
                            </p>
                            <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {task.companyName}
                          </p>
                          {task.description && (
                            <p className="text-[11px] text-muted-foreground/60 mt-1 line-clamp-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <div className={cn("h-1.5 w-1.5 rounded-full", priorityDot[task.priority])} />
                            <span className="text-[10px] text-muted-foreground">
                              {task.priority === "high" ? "Prioridad alta" : task.priority === "medium" ? "Prioridad media" : "Prioridad baja"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 pb-4">
            <button
              onClick={handleClose}
              className="w-full rounded-2xl bg-foreground text-card py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              {todayTasks.length > 0 ? "Empezar el día" : "Continuar"}
            </button>
          </div>
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
    </>
  );
}
