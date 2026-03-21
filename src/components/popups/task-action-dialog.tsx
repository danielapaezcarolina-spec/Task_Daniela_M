"use client";

import { useState } from "react";
import { Circle, Loader2, CheckCircle2, Pencil, MessageSquarePlus, ArrowRightCircle, X, Calendar, ChevronDown, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReminders } from "@/context/reminder-context";
import type { Task } from "@/lib/mock-data";

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

interface TaskActionDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onChangeStatus: (taskId: string, status: Task["status"], observation?: string) => void;
  onAddObservation: (taskId: string, text: string) => void;
  onEditTask: (taskId: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "dueDate" | "recurrence">>) => void;
}

export function TaskActionDialog({ task, open, onClose, onChangeStatus, onAddObservation, onEditTask }: TaskActionDialogProps) {
  const { addReminder } = useReminders();
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<ActionTab>("status");
  const [observation, setObservation] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<Task["status"] | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPriority, setEditPriority] = useState<Task["priority"]>("medium");
  const [editDueDate, setEditDueDate] = useState("");
  const [enableReminder, setEnableReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState("");
  const [reminderRepeat, setReminderRepeat] = useState(true);

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
        setEnableReminder(false);
        setReminderRepeat(true);
        // Default reminder time: next hour
        const now = new Date();
        now.setHours(now.getHours() + 1, 0, 0, 0);
        setReminderTime(now.toISOString().slice(0, 16));
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
    if (enableReminder && reminderTime) {
      addReminder({
        taskId: task.id,
        taskTitle: task.title,
        companyName: task.companyName,
        message: observation,
        scheduledTime: new Date(reminderTime).toISOString(),
        repeat: reminderRepeat,
        repeatIntervalMs: 180000,
        recipientPhone: "+584121234567", // Daniela's phone - will be configurable
      });
    }
    handleClose();
  };

  const handleEdit = () => {
    if (!editTitle.trim()) return;
    onEditTask(task.id, {
      title: editTitle,
      description: editDescription || undefined,
      priority: editPriority,
      dueDate: editDueDate,
    });
    handleClose();
  };

  const currentStatusConfig = statusOptions.find((s) => s.value === task.status)!;
  const CurrentIcon = currentStatusConfig.icon;

  const tabs: { value: ActionTab; label: string; icon: typeof Pencil }[] = [
    { value: "status", label: "Estado", icon: ArrowRightCircle },
    { value: "observation", label: "Observación", icon: MessageSquarePlus },
    { value: "edit", label: "Editar", icon: Pencil },
  ];

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
          <button onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Observations history */}
        {task.observations && task.observations.length > 0 && (
          <div className="px-5 pb-2">
            <div className="max-h-24 overflow-y-auto rounded-lg bg-muted/30 border border-border/30 p-2 space-y-1.5">
              {task.observations.slice(-3).map((obs) => {
                const obsStatus = statusOptions.find((s) => s.value === obs.status);
                return (
                  <div key={obs.id} className="flex items-start gap-1.5">
                    <div className={cn("h-1.5 w-1.5 rounded-full mt-1.5 shrink-0", obsStatus?.color.replace("text-", "bg-") || "bg-violet-400")} />
                    <div className="min-w-0">
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
                placeholder="Observación del cambio de estado (opcional)..."
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
              <p className="text-[10px] text-muted-foreground">Agrega una observación sin cambiar el estado de la tarea</p>
              <textarea
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                placeholder="Ej: Escribirle a Pedro para los documentos..."
                className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 resize-none transition-all"
                rows={2}
                autoFocus
              />

              {/* Reminder toggle */}
              <button
                type="button"
                onClick={() => setEnableReminder(!enableReminder)}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl border p-2.5 transition-all text-left",
                  enableReminder ? "border-violet-300 bg-violet-50/50" : "border-border/50 hover:border-border"
                )}
              >
                <Bell className={cn("h-4 w-4 shrink-0", enableReminder ? "text-violet-500" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground">Programar recordatorio</p>
                  <p className="text-[9px] text-muted-foreground">Te notifica por WhatsApp y en el celular</p>
                </div>
                <div className={cn("h-5 w-9 rounded-full transition-colors flex items-center px-0.5", enableReminder ? "bg-violet-500" : "bg-muted")}>
                  <div className={cn("h-4 w-4 rounded-full bg-white shadow-sm transition-transform", enableReminder ? "translate-x-3.5" : "translate-x-0")} />
                </div>
              </button>

              {/* Reminder options */}
              {enableReminder && (
                <div className="space-y-2 rounded-xl bg-violet-50/30 border border-violet-100 p-2.5 animate-in slide-in-from-top-1 duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-muted-foreground">Hora del recordatorio</label>
                    <input
                      type="datetime-local"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setReminderRepeat(!reminderRepeat)}
                    className="flex items-center gap-2 w-full"
                  >
                    <div className={cn("h-4 w-4 rounded border flex items-center justify-center transition-colors", reminderRepeat ? "bg-violet-500 border-violet-500" : "border-border bg-card")}>
                      {reminderRepeat && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-[10px] text-foreground">Repetir cada 3 min hasta completar</span>
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={handleClose} className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleAddObservation}
                  disabled={!observation.trim()}
                  className={cn("flex-1 rounded-xl py-2.5 text-xs font-medium transition-colors", observation.trim() ? "bg-violet-500 text-white hover:bg-violet-600 shadow-md shadow-violet-200/50" : "bg-muted text-muted-foreground cursor-not-allowed")}
                >
                  {enableReminder ? "Guardar y programar" : "Guardar observación"}
                </button>
              </div>
            </div>
          )}

          {/* EDIT TAB */}
          {activeTab === "edit" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Título</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground">Descripción</label>
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
                  <label className="text-[10px] font-medium text-muted-foreground">Fecha límite</label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-300 transition-all"
                  />
                </div>
              </div>
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
