"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface CompleteTaskDialogProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (taskId: string, comment: string) => void;
}

export function CompleteTaskDialog({ task, open, onClose, onConfirm }: CompleteTaskDialogProps) {
  const [comment, setComment] = useState("");
  const [visible, setVisible] = useState(false);

  // Animate in
  if (open && !visible) {
    setTimeout(() => setVisible(true), 10);
  }

  if (!open || !task) return null;

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setComment("");
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    onConfirm(task.id, comment);
    setVisible(false);
    setTimeout(() => {
      setComment("");
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        className={cn(
          "relative w-full max-w-sm rounded-2xl bg-card shadow-2xl overflow-hidden transition-all duration-200",
          visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4"
        )}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 mx-auto mb-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-foreground">Completar tarea</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{task.title}</p>
          <p className="text-[10px] text-muted-foreground/60">{task.companyName}</p>
        </div>

        {/* Comment input */}
        <div className="px-5 pb-4">
          <label className="text-[11px] font-medium text-muted-foreground block mb-1.5">
            Comentario (se incluye en el resumen)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ej: Se procesaron 15 facturas, pendiente 1 por falta de soporte..."
            className="w-full rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-300 resize-none transition-all"
            rows={3}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-medium text-white hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200/50"
          >
            Completar
          </button>
        </div>
      </div>
    </div>
  );
}
