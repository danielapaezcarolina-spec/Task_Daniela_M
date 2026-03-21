"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanies } from "@/hooks/use-companies";
import { useTasks } from "@/context/task-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Plus,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cardStyles: Record<string, { bg: string; iconBg: string; accent: string }> = {
  "1": { bg: "from-orange-100/80 via-amber-50 to-orange-50", iconBg: "bg-white/70 text-orange-500", accent: "bg-orange-400" },
  "2": { bg: "from-rose-100/80 via-pink-50 to-rose-50", iconBg: "bg-white/70 text-rose-500", accent: "bg-rose-400" },
  "3": { bg: "from-emerald-100/80 via-teal-50 to-emerald-50", iconBg: "bg-white/70 text-emerald-500", accent: "bg-emerald-400" },
  "4": { bg: "from-orange-100/80 via-amber-50 to-orange-50", iconBg: "bg-white/70 text-orange-500", accent: "bg-orange-400" },
};

export default function EmpresasPage() {
  const { tasks } = useTasks();
  const { companies } = useCompanies();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Empresas</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Gestiona tus empresas y sus tareas</p>
      </div>

      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 bg-card border-border/50 rounded-full text-xs sm:text-sm"
            />
          </div>
          <Button size="sm" className="rounded-full shadow-md shadow-primary/25 gap-1.5 h-8 px-3 text-xs">
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nueva Empresa</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredCompanies.map((company) => {
            const style = cardStyles[company.id] || cardStyles["1"];
            const companyTasks = tasks.filter((t) => t.companyId === company.id);
            const pending = companyTasks.filter((t) => t.status !== "done");
            const progress = company.tasksTotal > 0
              ? Math.round((company.tasksCompleted / company.tasksTotal) * 100) : 0;

            return (
              <div
                key={company.id}
                onClick={() => router.push(`/empresas/${company.id}`)}
                className="group cursor-pointer rounded-2xl sm:rounded-3xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className={cn("relative h-28 sm:h-40 bg-gradient-to-br flex items-center justify-center", style.bg)}>
                  <span className="absolute top-2 left-2 bg-foreground/80 text-card text-[8px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {pending.length} pendientes
                  </span>
                  <div className={cn("absolute top-2 right-2 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm", style.iconBg)}>
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <Building2 className="h-10 w-10 sm:h-14 sm:w-14 opacity-[0.06]" />
                </div>

                <div className="p-2.5 sm:p-4">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground leading-tight mb-0.5 truncate">{company.name}</h4>
                  <p className="text-[9px] sm:text-[11px] text-muted-foreground/60 mb-2 sm:mb-3">{company.rif}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-[11px] font-bold text-foreground bg-muted rounded-full px-2 py-0.5">{progress}%</span>
                      <div className="w-10 sm:w-14 h-1 rounded-full bg-muted hidden sm:block">
                        <div className={cn("h-1 rounded-full transition-all", style.accent)} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-foreground text-card group-hover:bg-primary transition-colors">
                      <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add */}
          <button className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-violet-200/60 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-violet-50/30 transition-all duration-300 min-h-[200px] sm:min-h-[280px]">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-violet-50">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium">Agregar Empresa</span>
          </button>
        </div>
      </div>
    </>
  );
}
