"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Task, AccountReceivable } from "@/lib/types";
import { useCompanies } from "@/hooks/use-companies";
import { useAccountsReceivable } from "@/hooks/use-accounts-receivable";
import { useTasks } from "@/context/task-context";
import { TaskActionDialog } from "@/components/popups/task-action-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NewCompanyDialog } from "@/components/popups/new-company-dialog";
import { sendWAMessage } from "@/lib/whatsapp-client";
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
  DollarSign,
  FileText,
  TrendingUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MainTab = "tareas" | "cuentas";
type FilterStatus = "all" | "todo" | "in_progress" | "done";
type ARFilter = "all" | "pending" | "partial" | "paid" | "overdue";
type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

const recurrenceLabels: Record<RecurrenceType, string> = { none: "Una vez", daily: "Diaria", weekly: "Semanal", monthly: "Mensual" };
const recurrenceColors: Record<RecurrenceType, string> = { none: "bg-gray-100 text-gray-600", daily: "bg-violet-50 text-violet-600", weekly: "bg-violet-50 text-violet-600", monthly: "bg-violet-50 text-violet-600" };
const priorityConfig = {
  high: { label: "Alta", color: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  medium: { label: "Media", color: "bg-violet-50 text-violet-600", dot: "bg-violet-400" },
  low: { label: "Baja", color: "bg-violet-50/50 text-violet-500", dot: "bg-violet-300" },
};
const statusConfig = {
  todo: { label: "Pendiente", icon: Circle, color: "text-violet-300" },
  in_progress: { label: "En progreso", icon: Loader2, color: "text-violet-500" },
  done: { label: "Completada", icon: CheckCircle2, color: "text-emerald-500" },
};
const arStatusConfig = {
  pending: { label: "Pendiente", color: "bg-violet-50 text-violet-700 border-violet-200" },
  partial: { label: "Parcial", color: "bg-violet-100 text-violet-700 border-violet-300" },
  paid: { label: "Pagada", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  overdue: { label: "Vencida", color: "bg-violet-100 text-violet-800 border-violet-400" },
};

export default function EmpresaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const { tasks: allTasks, updateTaskStatus, addObservation, updateTask, createTask } = useTasks();
  const { companies: companiesList, updateCompany, deleteCompany } = useCompanies();
  const { accounts: companyAR, createAR } = useAccountsReceivable(companyId);
  const company = companiesList.find((c) => c.id === companyId);
  const companyTasks = allTasks.filter((t) => t.companyId === companyId);

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [sendingResumen, setSendingResumen] = useState(false);
  const [resumenResult, setResumenResult] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<MainTab>("tareas");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [arFilter, setArFilter] = useState<ARFilter>("all");
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewAR, setShowNewAR] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [dailySummary, setDailySummary] = useState(company?.sendDailySummary ?? false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as Task["priority"], recurrence: "none" as RecurrenceType, dueDate: new Date().toISOString().split("T")[0] });
  const [newAR, setNewAR] = useState({ client: "", concept: "", amount: "", currency: "USD" as "USD" | "BS", dueDate: new Date().toISOString().split("T")[0] });

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

  const filteredAR = arFilter === "all" ? companyAR : companyAR.filter((ar) => ar.status === arFilter);
  const totalPending = companyAR.filter((ar) => ar.status !== "paid").reduce((sum, ar) => sum + (ar.amount - ar.amountPaid), 0);
  const totalCollected = companyAR.reduce((sum, ar) => sum + ar.amountPaid, 0);
  const overdueCount = companyAR.filter((ar) => ar.status === "overdue").length;

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    await createTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      recurrence: newTask.recurrence,
      dueDate: newTask.dueDate,
      companyId,
    });
    setNewTask({ title: "", description: "", priority: "medium", recurrence: "none", dueDate: new Date().toISOString().split("T")[0] });
    setShowNewTask(false);
  };

  const handleCreateAR = async () => {
    if (!newAR.client.trim() || !newAR.amount) return;
    await createAR({
      client: newAR.client,
      concept: newAR.concept,
      amount: newAR.amount,
      currency: newAR.currency,
      dueDate: newAR.dueDate,
    });
    setNewAR({ client: "", concept: "", amount: "", currency: "USD", dueDate: new Date().toISOString().split("T")[0] });
    setShowNewAR(false);
  };

  const handleDelete = async () => {
    await deleteCompany(companyId);
    router.push("/empresas");
  };

  const handleSendResumen = async () => {
    if (!company) return;
    setSendingResumen(true);
    setResumenResult(null);

    const pending = companyTasks.filter((t) => t.status === "todo");
    const inProg = companyTasks.filter((t) => t.status === "in_progress");
    const done = companyTasks.filter((t) => t.status === "done");

    const formatTask = (t: typeof companyTasks[0]) => {
      const lastObs = t.observations && t.observations.length > 0
        ? `\n   📝 ${t.observations[t.observations.length - 1].text}`
        : "";
      const due = new Date(t.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" });
      const prio = t.priority === "high" ? "🔴" : t.priority === "medium" ? "🟡" : "🟢";
      return `${prio} ${t.title} (vence ${due})${lastObs}`;
    };

    let msg = `📊 *Resumen de ${company.name}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    if (inProg.length > 0) {
      msg += `\n🔄 *En progreso (${inProg.length})*\n${inProg.map(formatTask).join("\n")}\n`;
    }
    if (pending.length > 0) {
      msg += `\n⏳ *Pendientes (${pending.length})*\n${pending.map(formatTask).join("\n")}\n`;
    }
    if (done.length > 0) {
      msg += `\n✅ *Completadas (${done.length})*\n${done.map((t) => `• ${t.title}`).join("\n")}\n`;
    }
    msg += `\n━━━━━━━━━━━━━━━━━━\nTotal: ${companyTasks.length} tareas`;

    try {
      const sent = await sendWAMessage(company.phone, msg);
      setResumenResult(sent ? "✅ Resumen enviado a " + company.contactName : "❌ No se pudo enviar. Verifica la conexión de WhatsApp.");
    } catch {
      setResumenResult("❌ Error al enviar el resumen.");
    } finally {
      setSendingResumen(false);
      setTimeout(() => setResumenResult(null), 4000);
    }
  };

  return (
    <>
      <NewCompanyDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        mode="edit"
        initialData={company ? { name: company.name, rif: company.rif, phone: company.phone, contactName: company.contactName } : undefined}
        onCreate={async (data) => { await updateCompany(companyId, data); }}
      />

      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.push("/empresas")} className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card border border-border/50 hover:bg-muted transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">{company.name}</h1>
          <p className="text-[11px] sm:text-sm text-muted-foreground">{company.rif}</p>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <button onClick={() => setShowEdit(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50 hover:bg-violet-50 hover:border-violet-200 transition-colors">
            <Pencil className="h-3.5 w-3.5 text-violet-500" />
          </button>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="flex h-8 w-8 items-center justify-center rounded-full bg-card border border-border/50 hover:bg-rose-50 hover:border-rose-200 transition-colors">
              <Trash2 className="h-3.5 w-3.5 text-rose-500" />
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-full px-2 py-1">
              <span className="text-[10px] text-rose-700 font-medium">¿Eliminar?</span>
              <button onClick={handleDelete} className="text-[10px] font-bold text-rose-700 hover:text-rose-900 px-1">Sí</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-[10px] text-muted-foreground hover:text-foreground px-1">No</button>
            </div>
          )}
        </div>
      </div>

      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Info + Stats container */}
        <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:divide-x divide-border/50">
            {/* Left: Contact + WhatsApp */}
            <div className="flex-1 p-3 sm:p-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 shrink-0">
                  <User className="h-3 w-3 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{company.contactName}</p>
                  <p className="text-[10px] text-muted-foreground leading-none">Contacto</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                  <Phone className="h-3 w-3 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{company.phone}</p>
                  <p className="text-[10px] text-muted-foreground leading-none">WhatsApp</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 shrink-0">
                  <MessageSquare className="h-3 w-3 text-emerald-500" />
                </div>
                <div className="min-w-0 mr-1">
                  <p className="text-xs font-medium">Resumen diario</p>
                  <p className="text-[10px] text-muted-foreground leading-none">Al final del día</p>
                </div>
                <Switch checked={dailySummary} onCheckedChange={setDailySummary} />
              </div>
              <div className="space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-6 text-[10px] px-3"
                  onClick={handleSendResumen}
                  disabled={sendingResumen}
                >
                  <Send className="h-2.5 w-2.5" />
                  {sendingResumen ? "Enviando..." : "Enviar resumen"}
                </Button>
                {resumenResult && (
                  <p className="text-[9px] text-muted-foreground">{resumenResult}</p>
                )}
              </div>
            </div>

            {/* Right: Stats */}
            <div className="grid grid-cols-3 sm:w-[280px] lg:w-[320px] shrink-0 border-t sm:border-t-0 border-border/50">
              <div className="flex flex-col items-center justify-center p-3 sm:p-4">
                <p className="text-xl sm:text-2xl font-bold text-foreground">{todoCount}</p>
                <p className="text-[9px] sm:text-[11px] text-muted-foreground">Pendientes</p>
              </div>
              <div className="flex flex-col items-center justify-center p-3 sm:p-4 border-x border-border/50">
                <p className="text-xl sm:text-2xl font-bold text-violet-500">{progressCount}</p>
                <p className="text-[9px] sm:text-[11px] text-muted-foreground">En progreso</p>
              </div>
              <div className="flex flex-col items-center justify-center p-3 sm:p-4">
                <p className="text-xl sm:text-2xl font-bold text-emerald-500">{doneCount}</p>
                <p className="text-[9px] sm:text-[11px] text-muted-foreground">Completadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="flex gap-1 bg-muted rounded-2xl p-1">
          <button
            onClick={() => setMainTab("tareas")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all",
              mainTab === "tareas" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Tareas
          </button>
          <button
            onClick={() => setMainTab("cuentas")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all",
              mainTab === "cuentas" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <DollarSign className="h-3.5 w-3.5" />
            Cuentas por cobrar
          </button>
        </div>

        {/* ===== TAB: TAREAS ===== */}
        {mainTab === "tareas" && (
          <>
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

              {/* Tasks list */}
              <div className="space-y-2">
                {filtered.length === 0 && (
                  <div className="rounded-2xl bg-card border border-border/50 p-6 sm:p-8 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground">No hay tareas en esta categoría</p>
                  </div>
                )}
                {filtered.map((task) => {
                  const StatusIcon = statusConfig[task.status].icon;
                  return (
                    <div key={task.id} onClick={() => setTaskToComplete(task)} className={cn("group rounded-2xl bg-card border border-border/50 p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer", task.status === "done" && "opacity-60")}>
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className={cn("mt-0.5 shrink-0", statusConfig[task.status].color)}>
                          <StatusIcon className={cn("h-4 w-4 sm:h-5 sm:w-5", task.status === "in_progress" && "animate-spin")} />
                        </div>
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
                            {task.observations && task.observations.length > 0 && (
                              <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-500 flex items-center gap-0.5">
                                <MessageSquare className="h-2 w-2 sm:h-2.5 sm:w-2.5" />{task.observations.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ===== TAB: CUENTAS POR COBRAR ===== */}
        {mainTab === "cuentas" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-2xl font-bold text-violet-600">${totalPending.toLocaleString()}</p>
                <p className="text-[9px] sm:text-[11px] text-muted-foreground">Por cobrar</p>
              </div>
              <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-2xl font-bold text-emerald-500">${totalCollected.toLocaleString()}</p>
                <p className="text-[9px] sm:text-[11px] text-muted-foreground">Cobrado</p>
              </div>
              <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
                <p className="text-lg sm:text-2xl font-bold text-violet-700">{overdueCount}</p>
                <p className="text-[9px] sm:text-[11px] text-muted-foreground">Vencidas</p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-foreground">Cuentas por cobrar</h2>
                <Button onClick={() => setShowNewAR(!showNewAR)} className="rounded-full gap-1.5 shadow-md shadow-primary/25 h-8 text-xs px-3" size="sm">
                  {showNewAR ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  {showNewAR ? "Cancelar" : "Nueva"}
                </Button>
              </div>

              {/* New AR form */}
              {showNewAR && (
                <div className="rounded-2xl bg-card border border-primary/20 p-3.5 sm:p-5 space-y-3 sm:space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] sm:text-xs font-medium">Cliente</Label>
                    <Input placeholder="Nombre del cliente" value={newAR.client} onChange={(e) => setNewAR({ ...newAR, client: e.target.value })} className="rounded-xl h-9 text-xs sm:text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] sm:text-xs font-medium">Concepto</Label>
                    <Input placeholder="Ej: Servicios contables - Marzo" value={newAR.concept} onChange={(e) => setNewAR({ ...newAR, concept: e.target.value })} className="rounded-xl h-9 text-xs sm:text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] sm:text-xs font-medium">Monto</Label>
                      <Input type="number" placeholder="0.00" value={newAR.amount} onChange={(e) => setNewAR({ ...newAR, amount: e.target.value })} className="rounded-xl h-9 text-xs sm:text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] sm:text-xs font-medium">Moneda</Label>
                      <div className="flex gap-1">
                        {(["USD", "BS"] as const).map((c) => (
                          <button key={c} onClick={() => setNewAR({ ...newAR, currency: c })} className={cn("flex-1 text-[10px] sm:text-[11px] font-medium py-1.5 rounded-lg transition-all", newAR.currency === c ? "bg-foreground text-card" : "bg-muted text-muted-foreground")}>
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] sm:text-xs font-medium">Fecha de vencimiento</Label>
                      <Input type="date" value={newAR.dueDate} onChange={(e) => setNewAR({ ...newAR, dueDate: e.target.value })} className="rounded-xl h-9 text-xs sm:text-sm" />
                    </div>
                  </div>
                  <Button onClick={handleCreateAR} className="w-full rounded-full gap-2 h-9 text-xs sm:text-sm">
                    <Plus className="h-3.5 w-3.5" /> Registrar cuenta
                  </Button>
                </div>
              )}

              {/* AR Filters */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {([
                  { value: "all", label: "Todas", count: companyAR.length },
                  { value: "pending", label: "Pendientes", count: companyAR.filter((ar) => ar.status === "pending").length },
                  { value: "partial", label: "Parciales", count: companyAR.filter((ar) => ar.status === "partial").length },
                  { value: "overdue", label: "Vencidas", count: overdueCount },
                  { value: "paid", label: "Pagadas", count: companyAR.filter((ar) => ar.status === "paid").length },
                ] as const).map((tab) => (
                  <button key={tab.value} onClick={() => setArFilter(tab.value)} className={cn("flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap shrink-0", arFilter === tab.value ? "bg-foreground text-card" : "bg-muted text-muted-foreground")}>
                    {tab.label}
                    <span className={cn("text-[9px] px-1 py-0.5 rounded-full", arFilter === tab.value ? "bg-white/20" : "bg-background")}>{tab.count}</span>
                  </button>
                ))}
              </div>

              {/* AR List */}
              <div className="space-y-2">
                {filteredAR.length === 0 && (
                  <div className="rounded-2xl bg-card border border-border/50 p-6 sm:p-8 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground">No hay cuentas por cobrar en esta categoría</p>
                  </div>
                )}
                {filteredAR.map((ar) => {
                  const remaining = ar.amount - ar.amountPaid;
                  const paidPercent = Math.round((ar.amountPaid / ar.amount) * 100);
                  return (
                    <div key={ar.id} className={cn("rounded-2xl bg-card border border-border/50 p-3 sm:p-4 hover:shadow-md transition-all duration-200", ar.status === "paid" && "opacity-60")}>
                      <div className="flex items-start gap-2.5 sm:gap-3">
                        <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-violet-50">
                          <DollarSign className="h-4 w-4 text-violet-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium truncate">{ar.client}</p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">{ar.concept}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs sm:text-sm font-bold">{ar.currency} {ar.amount.toLocaleString()}</p>
                              {ar.status === "partial" && (
                                <p className="text-[10px] text-muted-foreground">Resta: {ar.currency} {remaining.toLocaleString()}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className={cn("text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full border", arStatusConfig[ar.status].color)}>
                              {arStatusConfig[ar.status].label}
                            </span>
                            {ar.status === "partial" && (
                              <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-600">
                                {paidPercent}% cobrado
                              </span>
                            )}
                            <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-muted-foreground ml-auto">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              Vence: {new Date(ar.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" })}
                            </span>
                          </div>
                          {/* Progress bar for partial payments */}
                          {ar.status === "partial" && (
                            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${paidPercent}%` }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <TaskActionDialog
        task={taskToComplete}
        open={!!taskToComplete}
        onClose={() => setTaskToComplete(null)}
        onChangeStatus={(taskId, status, obs) => {
          updateTaskStatus(taskId, status, obs);
          setTaskToComplete(null);
        }}
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
