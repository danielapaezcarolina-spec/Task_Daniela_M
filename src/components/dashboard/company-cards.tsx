"use client";

import { useCompanies } from "@/hooks/use-companies";
import { useTasks } from "@/context/task-context";
import { Building2, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const cardStyles = [
  { bg: "from-emerald-100/80 via-teal-50 to-emerald-50", iconBg: "bg-white/70 text-emerald-500", dot: "bg-emerald-400" },
  { bg: "from-orange-100/80 via-amber-50 to-orange-50", iconBg: "bg-white/70 text-orange-500", dot: "bg-orange-400" },
  { bg: "from-rose-100/80 via-pink-50 to-rose-50", iconBg: "bg-white/70 text-rose-500", dot: "bg-rose-400" },
  { bg: "from-emerald-100/80 via-teal-50 to-emerald-50", iconBg: "bg-white/70 text-emerald-500", dot: "bg-emerald-400" },
];

export function CompanyCards() {
  const { tasks } = useTasks();
  const { companies } = useCompanies();
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h3 className="text-sm sm:text-base font-semibold text-foreground">Empresas activas</h3>
        <Link
          href="/empresas"
          className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex-1 flex gap-2.5 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:gap-3 sm:content-start">
        {companies.map((company, index) => {
          const style = cardStyles[index % cardStyles.length];
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const companyTasks = tasks.filter((t) => t.companyId === company.id);
          const monthTasks = companyTasks.filter((t) => {
            const d = new Date(t.dueDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
          });
          const monthTotal = monthTasks.length;
          const monthDone = monthTasks.filter((t) => t.status === "done").length;
          const monthPending = monthTotal - monthDone;
          const progress = monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0;
          const monthName = now.toLocaleDateString("es", { month: "long" });

          return (
            <Link
              key={company.id}
              href={`/empresas/${company.id}`}
              className="group snap-start shrink-0 w-[160px] sm:w-auto"
            >
              <div className="rounded-2xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className={cn("relative h-20 sm:h-24 lg:h-20 xl:h-24 bg-gradient-to-br flex items-center justify-center overflow-hidden", style.bg)}>
                  <span className="absolute top-2 left-2 bg-foreground/80 text-card text-[8px] sm:text-[9px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {monthPending} pendientes
                  </span>
                  <div className={cn("absolute top-2 right-2 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm", style.iconBg)}>
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <Building2 className="h-10 w-10 sm:h-16 sm:w-16 opacity-[0.07]" />
                </div>

                <div className="p-2 sm:p-2.5">
                  <h4 className="font-bold text-[11px] sm:text-xs text-foreground leading-tight mb-0.5 truncate">
                    {company.name}
                  </h4>
                  <p className="text-[8px] sm:text-[9px] text-muted-foreground/60 mb-1.5 sm:mb-2 capitalize">
                    {monthDone}/{monthTotal} en {monthName}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-[10px] sm:text-[11px] font-bold rounded-full px-2 py-0.5 sm:py-1",
                      progress >= 75 ? "bg-emerald-100 text-emerald-700" :
                      progress >= 40 ? "bg-orange-100 text-orange-700" :
                      "bg-rose-100 text-rose-700"
                    )}>
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
