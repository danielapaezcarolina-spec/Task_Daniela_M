"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { companies, type Task } from "@/lib/mock-data";
import { useTasks } from "@/context/task-context";
import { CompleteTaskDialog } from "@/components/popups/complete-task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Building2,
  Phone,
  User,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  Repeat,
  MessageSquare,
  Send,
  X,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FilterStatus = "all" | "todo" | "in_progress" | "done";
type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

const recurrenceLabels: Record<RecurrenceType, string> = { none: "Una vez", daily: "Diaria", weekly: "Semanal", monthly: "Mensual" };
const recurrenceColors: Record<RecurrenceType, string> = { none: "bg-gray-100 text-gray-600", daily: "bg-blue-50 text-blue-600", weekly: "bg-amber-50 text-amber-600", monthly: "bg-violet-50 text-violet-600" };
const priorityConfig = {
  high: { label: "Alta", color: "bg-red-50 text-red-600", dot: "bg-red-400" },
  medium: { label: "Media", color: "bg-amber-50 text-amber-600", dot: "bg-amber-400" },
  low: { label: "Baja", color: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-400" },
};
const statusConfig = {
  todo: { label: "Pendiente", icon: Circle, color: "text-gray-400" },
  in_progress: { label: "En progreso", icon: Loader2, color: "text-blue-500" },
  done: { label: "Completada", icon: CheckCircle2, color: "text-emerald-500" },
};

export default function EmpresaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { tasks: allTasks, completeTask } = useTasks();
  const company = companies.find((c) => c.id === companyId);
  const companyTasks = allTasks.filter((t) => t.companyId === companyId);

  const [filter, setFilter] = useState<FilterStatus>("all");
  const [showNewTask, setShowNewTask] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [dailySummary, setDailySummary] = useState(company?.sendDailySummary ?? false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as Task["priority"], recurrence: "none" as RecurrenceType, dueDate: new Date().toISOString().split("T")[0] });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-sm text-muted-foreground">Empresa no encontrada</p>
        <Button variant="outline" onClick={() => router.push("/empresas")} className="rounded-full gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
      </div>
    );
  }

  const filtered = filter === "all" ? companyTasks : companyTasks.filter((t) => t.status === filter);
  const todoCount = companyTasks.filter((t) => t.status === "todo").length;
  const progressCount = companyTasks.filter((t) => t.status === "in_progress").length;
  const doneCount = companyTasks.filter((t) => t.status === "done").length;

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;
    alert(`Tarea "${newTask.title}" creada (${recurrenceLabels[newTask.recurrence]})`);
    setNewTask({ title: "", description: "", priority: "medium", recurrence: "none", dueDate: new Date().toISOString().split("T")[0] });
    setShowNewTask(false);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/empresas")} className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card border border-border/50 hover:bg-muted transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{company.name}</h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground">{company.rif}</p>
        </div>
      </div>

      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Contact + WhatsApp - stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-card border border-border/50 p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
            <h3 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contacto</h3>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-violet-50 shrink-0">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">{company.contactName}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Contacto</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">{company.phone}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">WhatsApp</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            <h3 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resumen WhatsApp</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-green-50 shrink-0">
                  <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium">Resumen diario</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Al final del día</p>
                </div>
              </div>
              <Switch checked={dailySummary} onCheckedChange={setDailySummary} />
            </div>
            <Button variant="outline" className="w-full rounded-full gap-1.5 text-green-700 border-green-200 hover:bg-green-50 h-8 sm:h-9 text-xs" onClick={() => alert("Enviando resumen...")}>
              <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Enviar resumen ahora
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-foreground">{todoCount}</p>
            <p className="text-[9px] sm:text-[11px] text-muted-foreground">Pendientes</p>
          </div>
          <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-blue-500">{progressCount}</p>
            <p className="text-[9px] sm:text-[11px] text-muted-foreground">En progreso</p>
          </div>
          <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-emerald-500">{doneCount}</p>
            <p className="text-[9px] sm:text-[11px] text-muted-foreground">Completadas</p>
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-foreground">Tareas</h2>
            <Button onClick={() => setShowNewTask(!showNewTask)} className="rounded-full gap-1.5 shadow-md shadow-primary/25 h-8 text-xs px-3" size="sm">
              {showNewTask ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              {showNewTask ? "Cancelar" : "Nueva"}
            </Button>
          </div>

          {/* New task form */}
          {showNewTask && (
            <div className="rounded-2xl bg-card border border-primary/20 p-3.5 sm:p-5 space-y-3 sm:space-y-4 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs font-medium">Título</Label>
                <Input placeholder="Ej: Declaración de IVA" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="rounded-xl h-9 text-xs sm:text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] sm:text-xs font-medium">Descripción</Label>
                <Textarea placeholder="Detalles..." value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="rounded-xl resize-none text-xs sm:text-sm" rows={2} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs font-medium">Prioridad</Label>
                  <div className="flex gap-1">
                    {(["low", "medium", "high"] as const).map((p) => (
                      <button key={p} onClick={() => setNewTask({ ...newTask, priority: p })} className={cn("flex-1 text-[10px] sm:text-[11px] font-medium py-1.5 rounded-lg transition-all", newTask.priority === p ? priorityConfig[p].color + " ring-1 ring-current" : "bg-muted text-muted-foreground")}>
                        {priorityConfig[p].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs font-medium">Recurrencia</Label>
                  <div className="relative">
                    <select value={newTask.recurrence} onChange={(e) => setNewTask({ ...newTask, recurrence: e.target.value as RecurrenceType })} className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-1.5 text-xs sm:text-sm pr-8 h-9">
                      <option value="none">Una vez</option>
                      <option value="daily">Diaria</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-xs font-medium">{newTask.recurrence === "none" ? "Fecha límite" : "Próxima fecha"}</Label>
                  <Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="rounded-xl h-9 text-xs sm:text-sm" />
                </div>
              </div>
              <Button onClick={handleCreateTask} className="w-full rounded-full gap-2 h-9 text-xs sm:text-sm">
                <Plus className="h-3.5 w-3.5" /> Crear Tarea
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {([
              { value: "all", label: "Todas", count: companyTasks.length },
              { value: "todo", label: "Pendientes", count: todoCount },
              { value: "in_progress", label: "En curso", count: progressCount },
              { value: "done", label: "Listas", count: doneCount },
            ] as const).map((tab) => (
              <button key={tab.value} onClick={() => setFilter(tab.value)} className={cn("flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0", filter === tab.value ? "bg-foreground text-card" : "bg-muted text-muted-foreground")}>
                {tab.label}
                <span className={cn("text-[9px] px-1 py-0.5 rounded-full", filter === tab.value ? "bg-white/20" : "bg-background")}>{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="rounded-2xl bg-card border border-border/50 p-6 sm:p-8 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">No hay tareas en esta categoría</p>
              </div>
            )}
            {filtered.map((task) => {
              const StatusIcon = statusConfig[task.status].icon;
              return (
                <div key={task.id} className={cn("group rounded-2xl bg-card border border-border/50 p-3 sm:p-4 hover:shadow-md transition-all duration-200", task.status === "done" && "opacity-60")}>
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <button
                      className={cn("mt-0.5 shrink-0 hover:scale-110 transition-transform", statusConfig[task.status].color)}
                      onClick={() => { if (task.status !== "done") setTaskToComplete(task); }}
                      title={task.status !== "done" ? "Marcar como completada" : undefined}
                    >
                      <StatusIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", task.status === "in_progress" && "animate-spin")} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-xs sm:text-sm font-medium", task.status === "done" && "line-through text-muted-foreground")}>{task.title}</p>
                      {task.description && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {task.recurrence !== "none" && (
                          <span className={cn("text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5", recurrenceColors[task.recurrence])}>
                            <Repeat className="h-2 w-2 sm:h-2.5 sm:w-2.5" />{recurrenceLabels[task.recurrence]}
                          </span>
                        )}
                        <span className={cn("text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full", priorityConfig[task.priority].color)}>{priorityConfig[task.priority].label}</span>
                        <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-muted-foreground ml-auto">
                          <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {new Date(task.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
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
