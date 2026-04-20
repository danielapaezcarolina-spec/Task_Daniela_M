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
    <div className="rounded-2xl bg-card p-3 sm:p-4 shadow-sm border border-border/50">
      <h3 className="text-[11px] sm:text-xs font-semibold text-foreground mb-2 sm:mb-3">
        Acciones rapidas
      </h3>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-2 lg:grid-cols-2">
        <Button
          variant="default"
          className="justify-start gap-1.5 rounded-xl h-8 sm:h-9 text-[10px] sm:text-xs w-full px-2.5"
          onClick={onNewTask}
        >
          <Plus className="h-3 w-3 shrink-0" />
          <span className="truncate">Nueva Tarea</span>
        </Button>

        <Button
          variant="outline"
          className="justify-start gap-1.5 rounded-xl h-8 sm:h-9 text-[10px] sm:text-xs w-full px-2.5"
          onClick={onNewCompany}
        >
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">Empresa</span>
        </Button>

        <Link href="/recordatorios" className="w-full">
          <Button variant="outline" className="justify-start gap-1.5 rounded-xl h-8 sm:h-9 text-[10px] sm:text-xs w-full px-2.5">
            <FileText className="h-3 w-3 shrink-0" />
            <span className="truncate">Nota</span>
          </Button>
        </Link>

        <Link href="/whatsapp" className="w-full">
          <Button variant="outline" className="justify-start gap-1.5 rounded-xl h-8 sm:h-9 text-[10px] sm:text-xs w-full px-2.5">
            <MessageCircle className="h-3 w-3 shrink-0" />
            <span className="truncate">Resumen</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
