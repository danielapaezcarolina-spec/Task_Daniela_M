"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  Building2,
  FileText,
  MessageCircle,
} from "lucide-react";

const actions = [
  { label: "Nueva Tarea", icon: Plus, variant: "default" as const },
  { label: "Agregar Empresa", icon: Building2, variant: "outline" as const },
  { label: "Crear Nota", icon: FileText, variant: "outline" as const },
  { label: "Enviar Resumen", icon: MessageCircle, variant: "outline" as const },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-sm border border-border/50">
      <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">
        Acciones rápidas
      </h3>
      {/* Grid on mobile, stack on sidebar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 lg:grid-cols-1 sm:gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="justify-start gap-2 sm:gap-3 rounded-xl h-10 sm:h-11 text-xs sm:text-sm w-full"
          >
            <action.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
