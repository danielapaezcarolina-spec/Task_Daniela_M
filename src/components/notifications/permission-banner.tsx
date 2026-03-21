"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { isNotificationSupported, requestNotificationPermission, getNotificationPermission } from "@/lib/notifications";
import { cn } from "@/lib/utils";

export function PermissionBanner() {
  const [show, setShow] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (!isNotificationSupported()) return;
    const perm = getNotificationPermission();
    setPermission(perm);
    const dismissed = localStorage.getItem("notif-banner-dismissed");
    if (perm === "default" && !dismissed) {
      setShow(true);
    }
  }, []);

  if (!show || permission !== "default") return null;

  const handleEnable = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("notif-banner-dismissed", "1");
    setShow(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-2">
      <div className="rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 p-3 sm:p-4 text-white shadow-lg shadow-violet-300/30 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shrink-0">
          <Bell className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold">Activa las notificaciones</p>
          <p className="text-[10px] sm:text-xs text-white/70">Recibe recordatorios de tareas en tu celular</p>
        </div>
        <button
          onClick={handleEnable}
          className="shrink-0 rounded-full bg-white text-violet-700 px-3 py-1.5 text-[10px] sm:text-xs font-semibold hover:bg-white/90 transition-colors"
        >
          Activar
        </button>
        <button onClick={handleDismiss} className="shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
