"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useTasks } from "@/context/task-context";
import { useReminders } from "@/context/reminder-context";
import { getMorningGreeting, getMorningComment, getEveningGreeting, getEveningComment } from "@/lib/wa-templates";
import { companies } from "@/lib/mock-data";
import { getWAStatus, connectWA, disconnectWA, sendWAMessage, type WAStatus } from "@/lib/whatsapp-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  QrCode,
  Send,
  CheckCheck,
  Clock,
  RefreshCw,
  AlertTriangle,
  FileText,
  User,
  Building2,
  Loader2,
  Wifi,
  WifiOff,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MessageType = "morning" | "alert" | "evening" | "client" | "reminder";

interface GeneratedMessage {
  id: string;
  type: MessageType;
  recipient: string;
  recipientPhone: string;
  message: string;
  time: string;
  date: string;
  status: "sent" | "scheduled" | "pending";
}

const typeConfig: Record<MessageType, { label: string; icon: typeof FileText; badgeClass: string }> = {
  morning: { label: "Resumen matutino", icon: FileText, badgeClass: "bg-violet-50 text-violet-700" },
  alert: { label: "Alerta", icon: AlertTriangle, badgeClass: "bg-violet-100 text-violet-700" },
  evening: { label: "Resumen del día", icon: FileText, badgeClass: "bg-violet-50 text-violet-700" },
  client: { label: "Resumen cliente", icon: Building2, badgeClass: "bg-emerald-50 text-emerald-700" },
  reminder: { label: "Recordatorio", icon: Bell, badgeClass: "bg-violet-100 text-violet-700" },
};

export default function WhatsAppPage() {
  const { tasks } = useTasks();
  const { firedNotifications } = useReminders();
  const [waStatus, setWaStatus] = useState<WAStatus>({ status: "disconnected", qr: null });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  // Poll WhatsApp status
  const fetchStatus = useCallback(async () => {
    try {
      const st = await getWAStatus();
      setWaStatus(st);
    } catch {
      // API not available
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const st = await connectWA();
      setWaStatus(st);
    } catch { /* */ }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectWA();
      setWaStatus({ status: "disconnected", qr: null });
    } catch { /* */ }
    setLoading(false);
  };

  const handleSendMessage = async (msg: GeneratedMessage) => {
    setSending(msg.id);
    try {
      await sendWAMessage(msg.recipientPhone, msg.message);
    } catch { /* */ }
    setSending(null);
  };

  const messages = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const todayFormatted = today.toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" });

    const generated: GeneratedMessage[] = [];
    let msgId = 0;

    // --- MORNING SUMMARY for Daniela ---
    const todayTasks = tasks.filter((t) => t.dueDate === todayStr && t.status !== "done");
    const urgentToday = todayTasks.filter((t) => t.priority === "high");

    const companyLines = companies
      .map((company) => {
        const companyTodayTasks = todayTasks.filter((t) => t.companyId === company.id);
        if (companyTodayTasks.length === 0) return null;
        const urgent = companyTodayTasks.filter((t) => t.priority === "high").length;
        return `  - ${company.name}: ${companyTodayTasks.length} tarea${companyTodayTasks.length > 1 ? "s" : ""} pendiente${companyTodayTasks.length > 1 ? "s" : ""}${urgent > 0 ? ` (${urgent} urgente${urgent > 1 ? "s" : ""})` : ""}`;
      })
      .filter(Boolean);

    generated.push({
      id: String(++msgId),
      type: "morning",
      recipient: "Daniela (tu)",
      recipientPhone: "+584121234567",
      date: todayFormatted,
      time: "8:00 AM",
      status: "scheduled",
      message: `${getMorningGreeting()}\n\n${companyLines.length > 0 ? companyLines.join("\n") : "  Sin tareas programadas para hoy"}\n\nTotal: ${todayTasks.length} tarea${todayTasks.length !== 1 ? "s" : ""} | ${urgentToday.length} urgente${urgentToday.length !== 1 ? "s" : ""}${getMorningComment(todayTasks.length)}`,
    });

    // --- ALERTS for overdue/due-today tasks ---
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "done") return false;
      return t.dueDate <= todayStr && t.priority === "high";
    });

    overdueTasks.forEach((task) => {
      const isOverdue = task.dueDate < todayStr;
      const dueFormatted = new Date(task.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" });
      generated.push({
        id: String(++msgId),
        type: "alert",
        recipient: "Daniela (tu)",
        recipientPhone: "+584121234567",
        date: todayFormatted,
        time: "10:30 AM",
        status: "scheduled",
        message: `${isOverdue ? "VENCIDA" : "Alerta"}: ${task.title} - ${task.companyName}${isOverdue ? ` (vencio el ${dueFormatted})` : " (vence hoy)"}${task.description ? `\nDetalle: ${task.description}` : ""}`,
      });
    });

    // --- EVENING SUMMARY for Daniela ---
    const allTodayTasks = tasks.filter((t) => t.dueDate === todayStr);
    const completedToday = allTodayTasks.filter((t) => t.status === "done");
    const pendingToday = allTodayTasks.filter((t) => t.status !== "done");

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const tomorrowTasks = tasks.filter((t) => t.dueDate === tomorrowStr && t.status !== "done");

    const completedPercent = allTodayTasks.length > 0 ? Math.round((completedToday.length / allTodayTasks.length) * 100) : 100;
    let eveningMsg = `${getEveningGreeting()}\n\n✅ Completadas: ${completedToday.length}/${allTodayTasks.length} tareas\n⏳ Pendientes: ${pendingToday.length} tarea${pendingToday.length !== 1 ? "s" : ""}${getEveningComment(completedPercent)}`;

    if (pendingToday.length > 0) {
      eveningMsg += `\n\nTareas no completadas hoy:`;
      pendingToday.forEach((t) => {
        eveningMsg += `\n  - ${t.title} (${t.companyName})`;
      });
    }

    if (tomorrowTasks.length > 0) {
      eveningMsg += `\n\nPendiente para manana:`;
      tomorrowTasks.forEach((t) => {
        const priority = t.priority === "high" ? " [Urgente]" : "";
        eveningMsg += `\n  - ${t.title} (${t.companyName})${priority}`;
      });
    }

    generated.push({
      id: String(++msgId),
      type: "evening",
      recipient: "Daniela (tu)",
      recipientPhone: "+584121234567",
      date: todayFormatted,
      time: "6:00 PM",
      status: "scheduled",
      message: eveningMsg,
    });

    // --- CLIENT SUMMARIES ---
    companies
      .filter((c) => c.sendDailySummary)
      .forEach((company) => {
        const companyAllTasks = tasks.filter((t) => t.companyId === company.id);
        const companyPending = companyAllTasks.filter((t) => t.status !== "done");
        const companyDone = companyAllTasks.filter((t) => t.status === "done");
        const companyUrgent = companyPending.filter((t) => t.priority === "high");

        let clientMsg = `Resumen para ${company.name}:\n\nEstado general:\n  Completadas: ${companyDone.length}/${companyAllTasks.length}\n  Pendientes: ${companyPending.length}\n  Urgentes: ${companyUrgent.length}`;

        if (companyPending.length > 0) {
          clientMsg += `\n\nTareas pendientes:`;
          companyPending.forEach((t) => {
            const due = new Date(t.dueDate).toLocaleDateString("es", { day: "2-digit", month: "short" });
            const priority = t.priority === "high" ? " [Urgente]" : "";
            const statusLabel = t.status === "in_progress" ? " (en progreso)" : "";
            clientMsg += `\n  - ${t.title} | Vence: ${due}${priority}${statusLabel}`;
          });
        }

        if (companyDone.length > 0) {
          clientMsg += `\n\nCompletadas recientemente:`;
          companyDone.slice(0, 3).forEach((t) => {
            const completedDate = t.completedAt
              ? new Date(t.completedAt).toLocaleDateString("es", { day: "2-digit", month: "short" })
              : "-";
            clientMsg += `\n  - ${t.title} (${completedDate})`;
            if (t.completionComment) {
              clientMsg += `\n    Nota: ${t.completionComment}`;
            }
          });
        }

        generated.push({
          id: String(++msgId),
          type: "client",
          recipient: company.contactName,
          recipientPhone: company.phone,
          date: todayFormatted,
          time: "6:30 PM",
          status: "scheduled",
          message: clientMsg,
        });
      });

    // --- FIRED REMINDERS as messages ---
    firedNotifications.forEach((notif) => {
      generated.push({
        id: `rem-msg-${notif.id}`,
        type: "reminder",
        recipient: "Daniela (tu)",
        recipientPhone: notif.reminder.recipientPhone || "+584121234567",
        date: new Date(notif.firedAt).toLocaleDateString("es", { day: "2-digit", month: "long", year: "numeric" }),
        time: new Date(notif.firedAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
        status: "sent",
        message: `Recordatorio: ${notif.reminder.message}\n\nTarea: ${notif.reminder.taskTitle}\nEmpresa: ${notif.reminder.companyName}`,
      });
    });

    return generated;
  }, [tasks, firedNotifications]);

  const sentCount = messages.filter((m) => m.status === "sent").length;
  const scheduledCount = messages.filter((m) => m.status === "scheduled").length;
  const isConnected = waStatus.status === "connected";

  return (
    <>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">WhatsApp</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Conexion y mensajes automatizados via Baileys</p>
      </div>

      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Connection */}
        <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className={cn("flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl shrink-0", isConnected ? "bg-emerald-50" : "bg-violet-50")}>
              {isConnected ? <Wifi className="h-5 w-5 sm:h-7 sm:w-7 text-emerald-600" /> : <WifiOff className="h-5 w-5 sm:h-7 sm:w-7 text-violet-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold text-foreground">Estado de conexion</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn("h-2 w-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : waStatus.status === "qr" ? "bg-violet-500 animate-pulse" : "bg-muted-foreground")} />
                <span className={cn("text-xs sm:text-sm font-medium", isConnected ? "text-emerald-600" : "text-muted-foreground")}>
                  {waStatus.status === "connected" ? "Conectado" : waStatus.status === "qr" ? "Esperando escaneo QR" : waStatus.status === "connecting" ? "Conectando..." : "Desconectado"}
                </span>
              </div>
            </div>
            {isConnected ? (
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-8" onClick={handleDisconnect} disabled={loading}>
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <WifiOff className="h-3 w-3" />}
                <span className="hidden sm:inline">Desconectar</span>
              </Button>
            ) : (
              <Button size="sm" className="rounded-full gap-1.5 text-xs h-8 shadow-md shadow-primary/25" onClick={handleConnect} disabled={loading || waStatus.status === "qr"}>
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <MessageCircle className="h-3 w-3" />}
                <span className="hidden sm:inline">Conectar</span>
              </Button>
            )}
          </div>

          {/* QR Code */}
          {waStatus.status === "qr" && waStatus.qr && (
            <div className="rounded-xl bg-white p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 border border-violet-200">
              <div className="bg-white p-4 rounded-xl">
                {/* QR as text - in production use qrcode library to render */}
                <div className="flex flex-col items-center gap-3">
                  <QrCode className="h-16 w-16 text-violet-500" />
                  <p className="text-xs font-mono text-center text-muted-foreground break-all max-w-[200px] line-clamp-3">
                    QR generado - escanea desde WhatsApp
                  </p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-foreground">Escanea el codigo QR con WhatsApp</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Abre WhatsApp {'>'} Dispositivos vinculados {'>'} Vincular dispositivo</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-7" onClick={fetchStatus}>
                <RefreshCw className="h-3 w-3" />
                Actualizar
              </Button>
            </div>
          )}

          {waStatus.status === "disconnected" && (
            <div className="rounded-xl bg-muted/50 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 border-2 border-dashed border-border">
              <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-violet-300" />
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-foreground">Conecta tu WhatsApp</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Presiona "Conectar" para generar el codigo QR</p>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
              <CheckCheck className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="text-xs font-medium text-emerald-700">WhatsApp conectado correctamente</p>
                <p className="text-[10px] text-emerald-600/70">Los recordatorios y resumenes se enviaran automaticamente</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-violet-600">{messages.length}</p>
            <p className="text-[9px] sm:text-[11px] text-muted-foreground">Mensajes hoy</p>
          </div>
          <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-emerald-500">{sentCount}</p>
            <p className="text-[9px] sm:text-[11px] text-muted-foreground">Enviados</p>
          </div>
          <div className="rounded-2xl bg-card border border-border/50 p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold text-violet-500">{scheduledCount}</p>
            <p className="text-[9px] sm:text-[11px] text-muted-foreground">Programados</p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Historial de mensajes</h3>
            <Button
              size="sm"
              className="rounded-full gap-1.5 shadow-md shadow-primary/25 h-8 text-xs"
              disabled={!isConnected}
              onClick={() => {
                const scheduled = messages.filter((m) => m.status === "scheduled");
                if (scheduled.length > 0) handleSendMessage(scheduled[0]);
              }}
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Enviar resumen</span>
              <span className="sm:hidden">Enviar</span>
            </Button>
          </div>

          {!isConnected && (
            <div className="rounded-2xl bg-violet-50 border border-violet-200 p-3 sm:p-4 flex items-center gap-2.5">
              <WifiOff className="h-4 w-4 text-violet-400 shrink-0" />
              <p className="text-[10px] sm:text-xs text-violet-600">Conecta WhatsApp para enviar mensajes automaticamente</p>
            </div>
          )}

          {/* Paginated collapsed messages */}
          {(() => {
            const totalPages = Math.ceil(messages.length / PAGE_SIZE);
            const paged = messages.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

            return (
              <>
                <div className="space-y-2">
                  {paged.map((msg) => {
                    const config = typeConfig[msg.type];
                    const TypeIcon = config.icon;
                    const isSending = sending === msg.id;
                    const isExpanded = expandedMsg === msg.id;

                    return (
                      <div key={msg.id} className="rounded-2xl bg-card border border-border/50 shadow-sm overflow-hidden">
                        {/* Collapsed header - always visible */}
                        <button
                          onClick={() => setExpandedMsg(isExpanded ? null : msg.id)}
                          className="w-full flex items-center gap-2 p-2.5 sm:p-3 text-left hover:bg-muted/30 transition-colors"
                        >
                          <Badge variant="secondary" className={cn("border-0 rounded-lg text-[8px] sm:text-[9px] gap-0.5 shrink-0 px-1.5", config.badgeClass)}>
                            <TypeIcon className="h-2.5 w-2.5" />
                            {config.label}
                          </Badge>
                          <span className="text-[10px] sm:text-xs font-medium text-foreground truncate flex-1">
                            {msg.recipient}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {msg.status === "sent" ? (
                              <CheckCheck className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-violet-400" />
                            )}
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground">{msg.time}</span>
                            <ChevronDown className={cn("h-3 w-3 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                          </div>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="px-2.5 sm:px-3 pb-2.5 sm:pb-3 space-y-2 animate-in slide-in-from-top-1 duration-150">
                            {/* Recipient */}
                            <div className="flex items-center gap-1.5 px-0.5">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                Para: <span className="font-medium text-foreground">{msg.recipient}</span>
                              </span>
                              <span className="text-[9px] text-muted-foreground/50">({msg.recipientPhone})</span>
                            </div>

                            {/* Message body */}
                            <div className="rounded-xl bg-muted/30 p-2.5 sm:p-3 border border-border/30">
                              <pre className="text-[10px] sm:text-[11px] text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                                {msg.message}
                              </pre>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-0.5">
                              <span className="text-[9px] text-muted-foreground/60">{msg.date}</span>
                              <div className="flex items-center gap-2">
                                {msg.status === "scheduled" && isConnected && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleSendMessage(msg); }}
                                    disabled={isSending}
                                    className="flex items-center gap-1 text-[9px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
                                  >
                                    {isSending ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Send className="h-2.5 w-2.5" />}
                                    Enviar ahora
                                  </button>
                                )}
                                <span className={cn(
                                  "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                                  msg.status === "sent" ? "bg-emerald-50 text-emerald-600" : "bg-violet-50 text-violet-600"
                                )}>
                                  {msg.status === "sent" ? "Enviado" : "Programado"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className={cn("flex h-7 w-7 items-center justify-center rounded-full transition-colors", page === 0 ? "text-muted-foreground/30" : "hover:bg-muted text-muted-foreground")}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i)}
                        className={cn("flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium transition-colors", page === i ? "bg-violet-500 text-white" : "hover:bg-muted text-muted-foreground")}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      disabled={page === totalPages - 1}
                      className={cn("flex h-7 w-7 items-center justify-center rounded-full transition-colors", page === totalPages - 1 ? "text-muted-foreground/30" : "hover:bg-muted text-muted-foreground")}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
}
