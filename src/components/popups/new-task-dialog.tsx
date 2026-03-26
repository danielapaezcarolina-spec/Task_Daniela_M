"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/types";

interface NewTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateTask: (data: { title: string; description?: string; priority: string; recurrence: string; weekDay?: number; dueDate: string; companyId?: string }) => Promise<void>;
  companies?: Company[];
  defaultCompanyId?: string;
}

const priorityConfig = {
  high: { label: "Urgente", color: "bg-rose-100 text-rose-700" },
  medium: { label: "Media", color: "bg-orange-100 text-orange-700" },
  low: { label: "Baja", color: "bg-violet-50 text-violet-600" },
};

export function NewTaskDialog({ open, onClose, onCreateTask, companies = [], defaultCompanyId }: NewTaskDialogProps) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "high" | "medium" | "low",
    recurrence: "none",
    weekDay: 1,
    dueDate: new Date().toISOString().split("T")[0],
    companyId: defaultCompanyId ?? "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await onCreateTask({
        title: form.title,
        description: form.description || undefined,
        priority: form.priority,
        recurrence: form.recurrence,
        weekDay: form.recurrence === "weekly_specific" ? form.weekDay : undefined,
        dueDate: form.dueDate,
        companyId: form.companyId || undefined,
      });
      setForm({ title: "", description: "", priority: "medium", recurrence: "none", weekDay: 1, dueDate: new Date().toISOString().split("T")[0], companyId: defaultCompanyId ?? "" });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Nueva Tarea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label className="text-xs">Título</Label>
            <Input
              placeholder="Ej: Declaración de IVA"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="h-9 rounded-xl text-sm"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Descripción (opcional)</Label>
            <Textarea
              placeholder="Detalles..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded-xl resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Company selector — only shown when not locked to a company */}
          {!defaultCompanyId && companies.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs">Empresa (opcional)</Label>
              <div className="relative">
                <select
                  value={form.companyId}
                  onChange={(e) => setForm((f) => ({ ...f, companyId: e.target.value }))}
                  className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-1.5 text-sm pr-8 h-9"
                >
                  <option value="">Sin empresa (tarea individual)</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-xs">Prioridad</Label>
            <div className="flex gap-1">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, priority: p }))}
                  className={cn("flex-1 text-[11px] font-medium py-1.5 rounded-lg transition-all", form.priority === p ? priorityConfig[p].color + " ring-1 ring-current" : "bg-muted text-muted-foreground")}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Recurrencia</Label>
              <div className="relative">
                <select
                  value={form.recurrence}
                  onChange={(e) => setForm((f) => ({ ...f, recurrence: e.target.value }))}
                  className="w-full appearance-none rounded-xl border border-border bg-card px-3 py-1.5 text-sm pr-8 h-9"
                >
                  <option value="none">Una vez</option>
                  <option value="daily">Diaria</option>
                  <option value="weekly">Semanal (L-V)</option>
                  <option value="weekly_specific">Semanal - Día específico</option>
                  <option value="monthly">Mensual</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fecha límite</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="h-9 rounded-xl text-sm"
              />
            </div>
          </div>

          {form.recurrence === "weekly_specific" && (
            <div className="space-y-1">
              <Label className="text-xs">Día de la semana</Label>
              <div className="flex gap-1">
                {([
                  { value: 1, label: "Lun" },
                  { value: 2, label: "Mar" },
                  { value: 3, label: "Mié" },
                  { value: 4, label: "Jue" },
                  { value: 5, label: "Vie" },
                ] as const).map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, weekDay: d.value }))}
                    className={cn(
                      "flex-1 text-[11px] font-medium py-1.5 rounded-lg transition-all",
                      form.weekDay === d.value ? "bg-violet-100 text-violet-700 ring-1 ring-violet-300" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-xl h-9 text-sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 rounded-xl h-9 text-sm" disabled={loading}>
              {loading ? "Guardando..." : "Crear tarea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
