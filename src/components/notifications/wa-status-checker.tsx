"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getWAStatus } from "@/lib/whatsapp-client";
import { Wifi, WifiOff, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const POLL_INTERVAL = 30_000;
const REDISMISS_DELAY = 300_000;

export function WAStatusChecker() {
  const router = useRouter();
  const [disconnected, setDisconnected] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [animate, setAnimate] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const { status } = await getWAStatus();
      const isOff = status === "disconnected";
      setDisconnected(isOff);

      if (!isOff) {
        setDismissed(false);
        setVisible(false);
      }
    } catch {
      setDisconnected(true);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkStatus]);

  useEffect(() => {
    if (disconnected && !dismissed) {
      const timer = setTimeout(() => {
        setVisible(true);
        setTimeout(() => setAnimate(true), 50);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [disconnected, dismissed]);

  const handleDismiss = () => {
    setAnimate(false);
    setTimeout(() => {
      setVisible(false);
      setDismissed(true);
    }, 200);

    setTimeout(() => setDismissed(false), REDISMISS_DELAY);
  };

  const handleConnect = () => {
    setAnimate(false);
    setTimeout(() => setVisible(false), 200);
    router.push("/whatsapp");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 z-[60] sm:max-w-sm w-auto pointer-events-none">
      <div
        className={cn(
          "pointer-events-auto rounded-2xl bg-card border border-red-200 shadow-2xl shadow-red-200/30 overflow-hidden transition-all duration-300",
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <WifiOff className="h-3 w-3 text-white/80" />
            <span className="text-[10px] font-medium text-white/90">WhatsApp desconectado</span>
          </div>
          <button
            onClick={handleDismiss}
            className="p-0.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-3 w-3 text-white/70" />
          </button>
        </div>

        <div className="p-3">
          <div className="flex items-start gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 shrink-0">
              <WifiOff className="h-4.5 w-4.5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">Sin conexion a WhatsApp</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Los recordatorios no se pueden enviar. Conecta WhatsApp para continuar.
              </p>
            </div>
          </div>

          <button
            onClick={handleConnect}
            className="w-full mt-3 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 py-2 text-[11px] font-semibold text-white hover:from-red-600 hover:to-orange-600 transition-all shadow-md shadow-red-200/40"
          >
            <Wifi className="h-3.5 w-3.5" />
            Conectar WhatsApp
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
