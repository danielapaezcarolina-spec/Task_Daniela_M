"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyFormData {
  name: string;
  rif: string;
  phone: string;
  contactName: string;
}

interface NewCompanyDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: CompanyFormData, daysBefore?: number) => Promise<void>;
  initialData?: CompanyFormData;
  initialDays?: number;
  mode?: "create" | "edit";
}

const DAY_OPTIONS = [1, 2, 3, 5, 7];

export function NewCompanyDialog({ open, onClose, onCreate, initialData, initialDays, mode = "create" }: NewCompanyDialogProps) {
  const [form, setForm] = useState<CompanyFormData>({ name: "", rif: "", phone: "", contactName: "" });
  const [daysBefore, setDaysBefore] = useState(initialDays ?? 3);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialData ?? { name: "", rif: "", phone: "", contactName: "" });
      setDaysBefore(initialDays ?? 3);
    }
  }, [open, initialData, initialDays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.rif || !form.phone || !form.contactName) return;
    setLoading(true);
    try {
      await onCreate({
        ...form,
        phone: form.phone.startsWith("+57") ? form.phone : `+57${form.phone.replace(/^0+/, "")}`,
      }, daysBefore);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {mode === "edit" ? "Editar Empresa" : "Nueva Empresa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label className="text-xs">Nombre</Label>
            <Input
              placeholder="Nombre de la empresa"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-9 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">RIF</Label>
            <Input
              placeholder="J-12345678-9"
              value={form.rif}
              onChange={(e) => setForm((f) => ({ ...f, rif: e.target.value }))}
              className="h-9 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Teléfono</Label>
            <Input
              placeholder="300 0000000"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="h-9 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nombre de contacto</Label>
            <Input
              placeholder="Nombre del contacto"
              value={form.contactName}
              onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
              className="h-9 rounded-xl text-sm"
            />
          </div>

          {/* Notification rule */}
          <div className="rounded-xl bg-violet-50/60 border border-violet-100 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-violet-500" />
              <Label className="text-xs font-medium text-violet-700">Notificar con anticipación</Label>
            </div>
            <div className="flex gap-1.5 items-center">
              {DAY_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDaysBefore(d)}
                  className={cn(
                    "h-8 w-8 rounded-xl text-xs font-bold transition-all",
                    daysBefore === d
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-white text-muted-foreground hover:bg-violet-100 hover:text-violet-600"
                  )}
                >
                  {d}
                </button>
              ))}
              <span className="text-[10px] text-muted-foreground pl-1">días antes</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1 rounded-xl h-9 text-sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 rounded-xl h-9 text-sm" disabled={loading}>
              {loading ? "Guardando..." : mode === "edit" ? "Guardar cambios" : "Crear empresa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
