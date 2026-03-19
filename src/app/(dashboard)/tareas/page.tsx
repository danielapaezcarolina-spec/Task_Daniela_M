"use client";

import { useState } from "react";
import { useTasks } from "@/context/task-context";
import { CompleteTaskDialog } from "@/components/popups/complete-task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  List,
  Columns3,
  Filter,
} from "lucide-react";
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

const statusLabels = {
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Completada",
};

const statusColors = {
  todo: "bg-violet-50 text-violet-700",
  in_progress: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
};

export default function TareasPage() {
  const { tasks, completeTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.companyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in_progress");
  const doneTasks = filteredTasks.filter((t) => t.status === "done");

  return (
    <>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Tareas</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Organiza y controla tu trabajo diario</p>
      </div>

      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 bg-card border-border/50 rounded-full text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-full p-0.5">
              <button
                onClick={() => setView("list")}
                className={cn("p-1.5 rounded-full transition-colors", view === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView("kanban")}
                className={cn("p-1.5 rounded-full transition-colors", view === "kanban" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")}
              >
                <Columns3 className="h-3.5 w-3.5" />
              </button>
            </div>

            <Button size="sm" className="rounded-full shadow-md shadow-primary/25 gap-1.5 h-8 px-3 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nueva</span>
            </Button>
          </div>
        </div>

        {/* List view - mobile card style */}
        {view === "list" && (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <Checkbox
                    className="mt-0.5 rounded-md border-violet-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary h-4 w-4"
                    checked={task.status === "done"}
                    onCheckedChange={(checked) => {
                      if (checked && task.status !== "done") setTaskToComplete(task);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-xs sm:text-sm font-medium",
                      task.status === "done" ? "line-through text-muted-foreground" : "text-foreground"
                    )}>
                      {task.title}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
                      {task.companyName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <Badge variant="secondary" className={cn("text-[9px] sm:text-[10px] border-0 rounded-lg px-1.5", priorityStyles[task.priority])}>
                        {priorityLabels[task.priority]}
                      </Badge>
                      <Badge variant="secondary" className={cn("text-[9px] sm:text-[10px] border-0 rounded-lg px-1.5", statusColors[task.status])}>
                        {statusLabels[task.status]}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(task.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kanban view - horizontal scroll on mobile */}
        {view === "kanban" && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-3 px-3 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
            <KanbanColumn title="Por hacer" count={todoTasks.length} tasks={todoTasks} color="violet" />
            <KanbanColumn title="En progreso" count={inProgressTasks.length} tasks={inProgressTasks} color="amber" />
            <KanbanColumn title="Completadas" count={doneTasks.length} tasks={doneTasks} color="emerald" />
          </div>
        )}
      </div>

      <CompleteTaskDialog
        task={taskToComplete}
        open={!!taskToComplete}
        onClose={() => setTaskToComplete(null)}
        onConfirm={(taskId, comment) => {
          completeTask(taskId, comment);
          setTaskToComplete(null);
        }}
      />
    </>
  );
}

function KanbanColumn({
  title, count, tasks: columnTasks, color,
}: {
  title: string; count: number; tasks: Task[]; color: "violet" | "amber" | "emerald";
}) {
  const colorMap = {
    violet: { dot: "bg-violet-500" },
    amber: { dot: "bg-amber-500" },
    emerald: { dot: "bg-emerald-500" },
  };

  return (
    <div className="snap-start shrink-0 w-[280px] sm:w-auto space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <div className={cn("h-2 w-2 rounded-full", colorMap[color].dot)} />
        <h3 className="text-xs sm:text-sm font-semibold text-foreground">{title}</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-muted text-[10px] font-medium text-muted-foreground">
          {count}
        </span>
      </div>

      <div className="space-y-2">
        {columnTasks.map((task) => (
          <div key={task.id} className="rounded-2xl bg-card border border-border/50 p-3 shadow-sm">
            <div className="flex items-start justify-between mb-1.5">
              <Badge variant="secondary" className={cn("text-[9px] border-0 rounded-lg px-1.5", priorityStyles[task.priority])}>
                {priorityLabels[task.priority]}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {new Date(task.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" })}
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-medium text-foreground mb-0.5">{task.title}</h4>
            {task.description && (
              <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
            )}
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              <span className="text-[10px] text-muted-foreground">{task.companyName}</span>
            </div>
          </div>
        ))}

        <button className="w-full rounded-xl border-2 border-dashed border-border/50 p-2.5 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground hover:border-primary hover:text-primary hover:bg-violet-50/50 transition-all">
          <Plus className="h-3 w-3" />
          Agregar
        </button>
      </div>
    </div>
  );
}
