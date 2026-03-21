"use client";

import { useCompanies } from "@/hooks/use-companies";
import { useTasks } from "@/context/task-context";
import { Building2, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const cardStyles: Record<string, { bg: string; iconBg: string; dot: string }> = {
  "1": { bg: "from-orange-100/80 via-amber-50 to-orange-50", iconBg: "bg-white/70 text-orange-500", dot: "bg-orange-400" },
  "2": { bg: "from-rose-100/80 via-pink-50 to-rose-50", iconBg: "bg-white/70 text-rose-500", dot: "bg-rose-400" },
  "3": { bg: "from-emerald-100/80 via-teal-50 to-emerald-50", iconBg: "bg-white/70 text-emerald-500", dot: "bg-emerald-400" },
  "4": { bg: "from-orange-100/80 via-amber-50 to-orange-50", iconBg: "bg-white/70 text-orange-500", dot: "bg-orange-400" },
};

export function CompanyCards() {
  const { tasks } = useTasks();
  const { companies } = useCompanies();
  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Empresas activas</h3>
        <Link
          href="/empresas"
          className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0">
        {companies.map((company) => {
          const style = cardStyles[company.id] || cardStyles["1"];
          const companyTasks = tasks.filter((t) => t.companyId === company.id);
          const pending = companyTasks.filter((t) => t.status !== "done");
          const progress = company.tasksTotal > 0
            ? Math.round((company.tasksCompleted / company.tasksTotal) * 100)
            : 0;

          return (
            <Link
              key={company.id}
              href={`/empresas/${company.id}`}
              className="group snap-start shrink-0 w-[160px] sm:w-auto"
            >
              <div className="rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className={cn("relative h-28 sm:h-36 bg-gradient-to-br flex items-center justify-center overflow-hidden", style.bg)}>
                  <span className="absolute top-2 left-2 bg-foreground/80 text-card text-[8px] sm:text-[9px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {pending.length} pendientes
                  </span>
                  <div className={cn("absolute top-2 right-2 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm", style.iconBg)}>
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <Building2 className="h-10 w-10 sm:h-16 sm:w-16 opacity-[0.07]" />
                </div>

                <div className="p-2.5 sm:p-3.5">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground leading-tight mb-0.5 truncate">
                    {company.name}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 mb-2 sm:mb-3">
                    {company.tasksCompleted}/{company.tasksTotal} completadas
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold text-foreground bg-muted rounded-full px-2 py-0.5 sm:py-1">
                      {progress}%
                    </span>
                    <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center bg-foreground text-card rounded-full group-hover:bg-primary transition-colors">
                      <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
