"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Building2, FileText, MessageCircle } from "lucide-react";

interface QuickActionsProps {
  onNewTask: () => void;
  onNewCompany: () => void;
}

export function QuickActions({ onNewTask, onNewCompany }: QuickActionsProps) {
  return (
    <div className="rounded-2xl bg-card p-4 sm:p-5 shadow-sm border border-border/50">
      <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">
        Acciones rápidas
      </h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 lg:grid-cols-1 sm:gap-2">
        <Button
          variant="default"
          className="justify-start gap-2 sm:gap-3 rounded-xl h-10 sm:h-11 text-xs sm:text-sm w-full"
          onClick={onNewTask}
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Nueva Tarea</span>
        </Button>

        <Button
          variant="outline"
          className="justify-start gap-2 sm:gap-3 rounded-xl h-10 sm:h-11 text-xs sm:text-sm w-full"
          onClick={onNewCompany}
        >
          <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
          <span className="truncate">Agregar Empresa</span>
        </Button>

        <Link href="/recordatorios" className="w-full">
          <Button variant="outline" className="justify-start gap-2 sm:gap-3 rounded-xl h-10 sm:h-11 text-xs sm:text-sm w-full">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Crear Nota</span>
          </Button>
        </Link>

        <Link href="/whatsapp" className="w-full">
          <Button variant="outline" className="justify-start gap-2 sm:gap-3 rounded-xl h-10 sm:h-11 text-xs sm:text-sm w-full">
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="truncate">Enviar Resumen</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
