"use client";

import { stats, companies } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const companyAvatars = [
  { initials: "AB", color: "bg-orange-100 text-orange-700" },
  { initials: "EF", color: "bg-red-100 text-red-700" },
  { initials: "SD", color: "bg-emerald-100 text-emerald-700" },
  { initials: "GM", color: "bg-violet-100 text-violet-700" },
];

export function ProgressSection() {
  const percentage = stats.completionRate;

  return (
    <div className="rounded-2xl bg-card p-4 sm:p-6 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Progreso</h3>
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-700 border-0 rounded-lg text-[10px]"
        >
          En curso
        </Badge>
      </div>

      <div className="flex items-center gap-4 sm:gap-8">
        {/* Percentage circle */}
        <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f0ecff" strokeWidth="10" />
            <circle
              cx="60" cy="60" r="50" fill="none" stroke="#7c3aed" strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 314} 314`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">{percentage}%</span>
          </div>
        </div>

        {/* Company progress */}
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
            {stats.completed} de {stats.totalTasks} tareas completadas
          </p>

          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Badge className="bg-violet-100 text-violet-700 border-0 rounded-lg hover:bg-violet-200 text-[10px] sm:text-xs">
              {companies.length} empresas
            </Badge>
          </div>

          <div className="flex -space-x-2">
            {companyAvatars.map((avatar, i) => (
              <Avatar key={i} className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-card">
                <AvatarFallback className={`${avatar.color} text-[10px] sm:text-xs font-semibold`}>
                  {avatar.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
