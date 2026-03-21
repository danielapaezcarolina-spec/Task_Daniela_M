"use client";

import { useReminders } from "@/context/reminder-context";
import { Bell, X, Clock, CheckCircle2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationToast() {
  const { firedNotifications, dismissNotification, snoozeReminder, dismissReminder } = useReminders();

  const visibleNotifs = firedNotifications.filter((n) => n.visible);
  if (visibleNotifs.length === 0) return null;

  return (
    <div className="fixed top-16 right-3 sm:right-6 z-[60] space-y-2 max-w-sm w-full pointer-events-none">
      {visibleNotifs.slice(0, 3).map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto rounded-2xl bg-card border border-border/50 shadow-2xl shadow-violet-200/30 overflow-hidden animate-in slide-in-from-top-2 duration-300"
        >
          {/* Header bar */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-3 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Bell className="h-3 w-3 text-white/80" />
              <span className="text-[10px] font-medium text-white/90">TaskConta</span>
            </div>
            <span className="text-[9px] text-white/60">
              {new Date(notif.firedAt).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-50 shrink-0 mt-0.5">
                <MessageCircle className="h-4 w-4 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">{notif.reminder.message}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {notif.reminder.taskTitle} - {notif.reminder.companyName}
                </p>
              </div>
              <button
                onClick={() => dismissNotification(notif.id)}
                className="shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-2.5">
              <button
                onClick={() => snoozeReminder(notif.reminder.id, 180000)}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-muted py-1.5 text-[10px] font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                <Clock className="h-3 w-3" />
                Recordar en 3 min
              </button>
              <button
                onClick={() => {
                  dismissReminder(notif.reminder.id);
                  dismissNotification(notif.id);
                }}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-emerald-500 py-1.5 text-[10px] font-medium text-white hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle2 className="h-3 w-3" />
                Listo
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
