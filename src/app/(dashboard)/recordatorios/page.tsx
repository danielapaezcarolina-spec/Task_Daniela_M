"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useNotificationRules } from "@/hooks/use-notification-rules";
import {
  Bell,
  Clock,
  MessageCircle,
  Sun,
  Moon,
  AlertTriangle,
  Plus,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

const reminders = [
  { id: "1", title: "Resumen matutino", description: "Recibe un resumen de tus tareas del día cada mañana", time: "8:00 AM", icon: Sun, enabled: true },
  { id: "2", title: "Alerta de vencimiento", description: "Notificación cuando una tarea está por vencer", time: "Automático", icon: AlertTriangle, enabled: true },
  { id: "3", title: "Resumen nocturno", description: "Resumen de lo completado y pendiente al final del día", time: "6:00 PM", icon: Moon, enabled: false },
  { id: "4", title: "Recordatorio semanal", description: "Resumen semanal de progreso por empresa", time: "Lunes 9:00 AM", icon: Clock, enabled: true },
];

const DAY_OPTIONS = [1, 2, 3, 5, 7];

export default function RecordatoriosPage() {
  const { generalRule, updateGeneralRule } = useNotificationRules();

  return (
    <>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Recordatorios</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Configura tus alertas y notificaciones</p>
      </div>

      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* WhatsApp status */}
        <div className="rounded-2xl bg-linear-to-r from-emerald-400 to-emerald-500 p-4 sm:p-5 text-white shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shrink-0">
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold">WhatsApp Conectado</h3>
              <p className="text-[11px] sm:text-sm text-white/80">Los recordatorios se enviarán a tu WhatsApp</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-medium hidden sm:inline">Activo</span>
            </div>
          </div>
        </div>

        {/* ===== REGLAS DE NOTIFICACIÓN ===== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Reglas de notificación</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Cuántos días antes notificar a Daniela por WhatsApp</p>
            </div>
          </div>

          {/* Regla general */}
          <div className="rounded-2xl bg-card border border-violet-200/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                <Bell className="h-4 w-4 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">Regla general</h4>
                    <p className="text-[10px] text-muted-foreground">Aplica a todas las empresas que no tengan regla individual</p>
                  </div>
                  <Switch
                    checked={generalRule.enabled}
                    onCheckedChange={(v) => updateGeneralRule({ enabled: v })}
                  />
                </div>
                <div className={cn("mt-3", !generalRule.enabled && "opacity-40 pointer-events-none")}>
                  <p className="text-[10px] text-muted-foreground mb-2">Días de anticipación</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAY_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => updateGeneralRule({ daysBefore: d })}
                        className={cn(
                          "h-8 w-8 rounded-xl text-xs font-bold transition-all",
                          generalRule.daysBefore === d
                            ? "bg-violet-600 text-white shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-violet-50 hover:text-violet-600"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                    <span className="flex items-center text-[10px] text-muted-foreground pl-1">días antes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reminders */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Mis Recordatorios</h3>
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Nuevo
            </Button>
          </div>

          {reminders.map((reminder) => (
            <div key={reminder.id} className="rounded-2xl bg-card border border-border/50 p-3.5 sm:p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                  <reminder.icon className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">{reminder.title}</h4>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-0 rounded-lg text-[8px] sm:text-[10px] px-1.5 shrink-0">
                      <Smartphone className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
                      WA
                    </Badge>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2 line-clamp-2">{reminder.description}</p>
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {reminder.time}
                  </div>
                </div>
                <Switch defaultChecked={reminder.enabled} className="shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
