"use client";

import {
  CheckSquare,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { stats } from "@/lib/mock-data";

const statItems = [
  { label: "Total", value: stats.totalTasks, icon: CheckSquare, color: "text-violet-600", bg: "bg-violet-50" },
  { label: "Listas", value: stats.completed, icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "En curso", value: stats.inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "Urgentes", value: stats.urgentTasks, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center justify-center rounded-2xl bg-card p-2 sm:p-3 shadow-sm border border-border/50 hover:shadow-md transition-shadow aspect-square max-h-24"
        >
          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl mb-1 ${item.bg}`}>
            <item.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${item.color}`} />
          </div>
          <span className="text-lg sm:text-xl font-bold text-foreground leading-none">{item.value}</span>
          <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
