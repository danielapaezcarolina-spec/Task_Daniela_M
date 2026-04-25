"use client";

import { useState } from "react";
import { Circle, Loader2, CheckCircle2, Pencil, MessageSquarePlus, ArrowRightCircle, X, Bell, Trash2, Repeat } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

type ActionTab = "status" | "observation" | "edit";

const statusOptions: { value: Task["status"]; label: string; icon: typeof Circle; color: string; bg: string }[] = [
  { value: "todo", label: "Inicio", icon: Circle, color: "text-violet-400", bg: "bg-violet-50 border-violet-200" },
  { value: "in_progress", label: "En proceso", icon: Loader2, color: "text-violet-500", bg: "bg-violet-100 border-violet-300" },
  { value: "done", label: "Finalizada", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
];

const priorityOptions: { value: Task["priority"]; label: string }[] = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
];

const weekDayLabels: Record<number, string> = { 1: "Lunes", 2: "Martes", 3: "Miercoles", 4: "Jueves", 5: "Viernes" };

function formatTime12h(time: string) {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h % 12) || 12)}:${m.toString().padStart(2, "0")} ${suffix}`;
}

interface TaskActionDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onChangeStatus: (taskId: string, status: Task["status"], observation?: string) => void;
  onAddObservation: (taskId: string, text: string) => void;
  onEditTask: (taskId: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "dueDate" | "recurrence" | "autoReminder" | "autoReminderTime">>) => void;
  onDeleteTask?: (taskId: string) => void;
}

export function TaskActionDialog({ task, open, onClose, onChangeStatus, onAddObservation, onEditTask, onDeleteTask }: TaskActionDialogProps) {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ActionTab>("status");
  const [observation, setObservation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Task["status"] | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [editAutoReminder, setEditAutoReminder] = useState(false);
  const [editAutoReminderTime, setEditAutoReminderTime] = useState("09:00");

  if (open && !visible) {
    setTimeout(() => {
      setVisible(true);
      if (task) {
        setSelectedStatus(null);
        setStatusNote("");
        setObservation("");
        setEditTitle(task.title);
        setEditDescription(task.description || "");
        setEditPriority(task.priority);
        setEditDueDate(task.dueDate);
        setEditAutoReminder(task.autoReminder || false);
        setEditAutoReminderTime(task.autoReminderTime || "09:00");
      }
    }, 10);
  }

  if (!open || !task) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setActiveTab("status");
      setObservation("");
      setStatusNote("");
      setSelectedStatus(null);
      onClose();
    }, 200);
  };

  const handleStatusChange = () => {
    if (!selectedStatus || selectedStatus === task.status) return;
    onChangeStatus(task.id, selectedStatus, statusNote || undefined);
    handleClose();
  };

  const handleAddObservation = () => {
    if (!observation.trim()) return;
    onAddObservation(task.id, observation);
    handleClose();
  };

  const handleEdit = () => {
    if (!editTitle.trim()) return;
    onEditTask(task.id, {
      title: editTitle,
      description: editDescription || undefined,
      priority: editPriority,
      dueDate: editDueDate,
      autoReminder: editAutoReminder,
      autoReminderTime: editAutoReminder ? editAutoReminderTime : undefined,
    });
    handleClose();
  };

  const currentStatusConfig = statusOptions.find((s) => s.value === task.status)!;
  const CurrentIcon = currentStatusConfig.icon;

  const tabs: { value: ActionTab; label: string; icon: typeof Pencil }[] = [
    { value: "status", label: "Estado", icon: ArrowRightCircle },
    { value: "observation", label: "Observacion", icon: MessageSquarePlus },
    { value: "edit", label: "Editar", icon: Pencil },
  ];

  const getScheduleText = () => {
    const rec = task.recurrence;
    if (rec === "daily" || rec === "weekly") return "de Lunes a Viernes";
    if (rec === "weekly_specific" && task.weekDay != null) return `cada ${weekDayLabels[task.weekDay] || ""}`;
    if (rec === "monthly") return `el dia ${new Date(task.dueDate + "T12:00").getDate()} de cada mes`;
    return `el ${new Date(task.dueDate + "T12:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={cn("absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200", visible ? "opacity-100" : "opacity-0")}
        onClick={handleClose}
      />

      <div className={cn("relative w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden transition-all duration-200", visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4")}>
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2 mb-1">
              <CurrentIcon className={cn("h-4 w-4 shrink-0", currentStatusConfig.color, task.status === "in_progress" && "animate-spin")} />
              <h3 className="text-sm font-bold text-foreground truncate">{task.title}</h3>
            </div>
            <p className="text-[10px] text-muted-foreground">{task.companyName}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onDeleteTask && (
              <button
                onClick={() => { onDeleteTask(task.id); handleClose(); }}
                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
            )}
            <button onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Observations history */}
        {task.observations && task.observations.length > 0 && (
          <div className="px-5 pb-2">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Historial</p>
            <div className="max-h-32 overflow-y-auto rounded-xl bg-muted/30 border border-border/30 p-2 space-y-2">
              {[...task.observations].reverse().map((obs, i) => {
                const isStatusChange = obs.text.startsWith("Estado cambiado") || obs.text === "Tarea completada" || obs.text === "Tarea editada";
                const obsStatus = statusOptions.find((s) => s.value === obs.status);
                return (
                  <div key={obs.id} className="flex items-start gap-1.5">
                    <div className={cn(
                      "h-1.5 w-1.5 rounded-full mt-1.5 shrink-0",
                      isStatusChange
                        ? (obsStatus?.color.replace("text-", "bg-") || "bg-violet-400")
                        : "bg-orange-400"
                    )} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        {isStatusChange && (
                          <span className="text-[8px] font-semibold text-muted-foreground bg-muted px-1 py-0.5 rounded">
                            {obsStatus?.label ?? "cambio"}
                          </span>
                        )}
                        {!isStatusChange && i === 0 && (
                          <span className="text-[8px] font-semibold text-orange-600 bg-orange-50 px-1 py-0.5 rounded">ultima obs.</span>
                        )}
                      </div>
                      <p className="text-[10px] text-foreground leading-tight">{obs.text}</p>
                      <p className="text-[9px] text-muted-foreground/60">
                        {new Date(obs.date).toLocaleDateString("es", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-5 pb-3">
          <div className="flex gap-1 bg-muted rounded-xl p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all",
                  activeTab === tab.value ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-3 w-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-5 pb-5">
          {/* STATUS TAB */}
          {activeTab === "status" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedStatus === opt.value;
                  const isCurrent = task.status === opt.value && !selectedStatus;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedStatus(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all text-center",
                        isSelected
                          ? opt.bg + " ring-1 ring-current"
                          : isCurrent
                          ? "bg-muted/50 border-border"
                          : "border-border/50 hover:border-border hover:bg-muted/30"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", isSelected || isCurrent ? opt.color : "text-muted-foreground", opt.value === "in_progress" && (isSelected || isCurrent) && "animate-spin")} />
                      <span className="text-[10px] font-medium">{opt.label}</span>
                      {isCurrent && <span className="text-[8px] text-muted-foreground">Actual</span>}
                    </button>
                  );
                })}
              </div>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Observacion del cambio de estado (opcional)..."
                className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 resize-none transition-all"
                rows={2}
              />
              <button
                onClick={handleStatusChange}
                disabled={!selectedStatus || selectedStatus === task.status}
                className={cn(
                  "w-full rounded-xl py-2.5 text-xs font-medium transition-colors",
                  selectedStatus && selectedStatus !== task.status
                    ? selectedStatus === "done"
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200/50"
                      : "bg-violet-500 text-white hover:bg-violet-600 shadow-md shadow-violet-200/50"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {selectedStatus === "done" ? "Finalizar tarea" : selectedStatus === "in_progress" ? "Marcar en proceso" : selectedStatus === "todo" ? "Volver a inicio" : "Selecciona un estado"}
              </button>
            </div>
          )}

          {/* OBSERVATION TAB */}
          {activeTab === "observation" && (
            <div className="space-y-3">
              <p className="text-[10px] text-muted-foreground">Agrega una observacion sin cambiar el estado de la tarea</p>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ej: Escribirle a Pedro para los documentos..."
                className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 resize-none transition-all"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleClose} className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleAddObservation}
                  disabled={!observation.trim()}
                  className={cn("flex-1 rounded-xl py-2.5 text-xs font-medium transition-colors", observation.trim() ? "bg-violet-500 text-white hover:bg-violet-600 shadow-md shadow-violet-200/50" : "bg-muted text-muted-foreground cursor-not-allowed")}
                >
                  Guardar observacion
                </button>
              </div>
            </div>
          )}

          {/* EDIT TAB */}
          {activeTab === "edit" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Titulo</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Descripcion</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 resize-none transition-all"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground">Prioridad</label>
                  <div className="flex gap-1">
                    {priorityOptions.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setEditPriority(p.value)}
                        className={cn("flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all", editPriority === p.value ? "bg-violet-100 text-violet-700 ring-1 ring-violet-300" : "bg-muted text-muted-foreground")}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-muted-foreground">Fecha limite</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
                  />
                </div>
              </div>

              {/* Auto-reminder toggle */}
              <button
                type="button"
                onClick={() => setEditAutoReminder(!editAutoReminder)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl border p-2.5 transition-all text-left",
                  editAutoReminder ? "border-violet-300 bg-violet-50/50" : "border-border/50 hover:border-border"
                )}
              >
                <Bell className={cn("h-4 w-4 shrink-0", editAutoReminder ? "text-violet-500" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground">Recordatorio automatico</p>
                  <p className="text-[9px] text-muted-foreground">WhatsApp notifica segun la recurrencia</p>
                </div>
                <div className={cn("h-5 w-9 rounded-full transition-colors flex items-center px-0.5", editAutoReminder ? "bg-violet-500" : "bg-muted")}>
                  <div className={cn("h-4 w-4 rounded-full bg-white shadow-sm transition-transform", editAutoReminder ? "translate-x-3.5" : "translate-x-0")} />
                </div>
              </button>

              {editAutoReminder && (
                <div className="space-y-2.5 rounded-xl bg-violet-50/30 border border-violet-100 p-2.5 animate-in slide-in-from-top-1 duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Hora del recordatorio</label>
                    <input
                      type="time"
                      value={editAutoReminderTime}
                      onChange={(e) => setEditAutoReminderTime(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
                    />
                  </div>
                  <div className="rounded-lg bg-violet-100/50 px-2.5 py-2 flex items-start gap-2">
                    <Repeat className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-violet-700 leading-relaxed">
                      Se enviara {getScheduleText()} a las <span className="font-semibold">{formatTime12h(editAutoReminderTime)}</span>
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleClose} className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editTitle.trim()}
                  className="flex-1 rounded-xl bg-violet-500 py-2.5 text-xs font-medium text-white hover:bg-violet-600 transition-colors shadow-md shadow-violet-200/50"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
