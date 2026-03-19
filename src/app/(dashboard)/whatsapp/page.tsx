"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  QrCode,
  Send,
  CheckCheck,
  Clock,
  RefreshCw,
} from "lucide-react";

const messageHistory = [
  {
    id: "1", type: "summary",
    message: "Buenos días! Tus tareas para hoy:\n📋 Inversiones ABC: 3 tareas pendientes\n📋 Comercial El Faro: 2 tareas urgentes\nTotal: 5 tareas | 2 urgentes",
    time: "8:00 AM", status: "sent",
  },
  {
    id: "2", type: "alert",
    message: "⚠️ Tarea por vencer: Retenciones ISLR - Comercial El Faro S.A. (vence hoy)",
    time: "10:30 AM", status: "sent",
  },
  {
    id: "3", type: "summary",
    message: "Resumen del día:\n✅ Completadas: 4/6 tareas\n⏳ Pendientes: 2 tareas\n\nPendiente para mañana:\n- Declaración de IVA (Inversiones ABC)\n- Balance de comprobación (Grupo Montaña)",
    time: "6:00 PM", status: "scheduled",
  },
];

export default function WhatsAppPage() {
  return (
    <>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">WhatsApp</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Conexión y mensajes automatizados</p>
      </div>

      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Connection */}
        <div className="rounded-2xl bg-card border border-border/50 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 shrink-0">
              <MessageCircle className="h-5 w-5 sm:h-7 sm:w-7 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold text-foreground">Estado de conexión</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs sm:text-sm text-emerald-600 font-medium">Conectado</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs h-8">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reconectar</span>
            </Button>
          </div>

          {/* QR */}
          <div className="rounded-xl bg-muted/50 p-6 sm:p-8 flex flex-col items-center justify-center gap-3 sm:gap-4 border-2 border-dashed border-border">
            <QrCode className="h-12 w-12 sm:h-16 sm:w-16 text-violet-300" />
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-foreground">Escanea el código QR con WhatsApp</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Abre WhatsApp {'>'} Dispositivos vinculados {'>'} Vincular dispositivo</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Historial de mensajes</h3>
            <Button size="sm" className="rounded-full gap-1.5 shadow-md shadow-primary/25 h-8 text-xs">
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Enviar resumen</span>
              <span className="sm:hidden">Enviar</span>
            </Button>
          </div>

          {messageHistory.map((msg) => (
            <div key={msg.id} className="rounded-2xl bg-card border border-border/50 p-3.5 sm:p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2 sm:mb-3">
                <Badge variant="secondary" className={msg.type === "summary" ? "bg-violet-50 text-violet-700 border-0 rounded-lg text-[9px] sm:text-[10px]" : "bg-amber-50 text-amber-700 border-0 rounded-lg text-[9px] sm:text-[10px]"}>
                  {msg.type === "summary" ? "Resumen" : "Alerta"}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                  {msg.status === "sent" ? <CheckCheck className="h-3 w-3 text-emerald-500" /> : <Clock className="h-3 w-3 text-amber-500" />}
                  {msg.time}
                </div>
              </div>
              <pre className="text-xs sm:text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {msg.message}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
