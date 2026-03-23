"use client";

import { useState } from "react";
import { useTasks } from "@/context/task-context";
import { TaskActionDialog } from "@/components/popups/task-action-dialog";
import type { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Circle,
  Loader2,
  CheckCircle2,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const DAYS_FULL = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const priorityDot: Record<string, string> = {
  high: "bg-rose-500",
  medium: "bg-orange-400",
  low: "bg-violet-300",
};

const priorityConfig: Record<string, { badge: string; bg: string; label: string }> = {
  high:   { badge: "bg-rose-100 text-rose-700",   bg: "bg-rose-50/80",   label: "Alta" },
  medium: { badge: "bg-orange-100 text-orange-700", bg: "bg-orange-50/50", label: "Media" },
  low:    { badge: "bg-violet-50 text-violet-600",  bg: "bg-muted/30",     label: "Baja" },
};

const statusIcon: Record<string, { icon: typeof Circle; color: string }> = {
  todo: { icon: Circle, color: "text-violet-300" },
  in_progress: { icon: Loader2, color: "text-violet-500" },
  done: { icon: CheckCircle2, color: "text-emerald-400" },
};

export default function CalendarioPage() {
  const { tasks, updateTaskStatus, addObservation, updateTask } = useTasks();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth).toLocaleDateString("es", { month: "long", year: "numeric" });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today.getDate());
  };

  const getTasksForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tasks.filter((t) => t.dueDate === dateStr);
  };

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  const monthTasks = tasks.filter((t) => {
    const d = new Date(t.dueDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Calendario</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{monthTasks.length} tareas este mes</p>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} className="rounded-full gap-1.5 text-[10px] sm:text-xs h-7 sm:h-8 px-2.5 sm:px-3">
          <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          Hoy
        </Button>
      </div>

      <div className="py-4 sm:py-6">
        {/* Mobile: stacked. Desktop: side by side */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-violet-50 to-purple-50/50">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-full h-8 w-8 hover:bg-white/80">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-sm sm:text-lg font-bold text-foreground capitalize">{monthName}</h2>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-full h-8 w-8 hover:bg-white/80">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-1.5 sm:px-2 pt-2 sm:pt-3 pb-1">
              {DAYS.map((day, i) => (
                <div key={day} className={cn("py-1.5 sm:py-2 text-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider", i >= 5 ? "text-violet-400" : "text-muted-foreground")}>
                  <span className="sm:hidden">{day}</span>
                  <span className="hidden sm:inline">{DAYS_FULL[i]}</span>
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-0.5 sm:gap-1 px-1.5 sm:px-2 pb-2 sm:pb-3">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[3rem] sm:min-h-[5rem] p-1" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const isSelected = day === selectedDay;
                const dayTasks = getTasksForDay(day);
                const dayIndex = (firstDay + i) % 7;
                const isWeekend = dayIndex >= 5;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "min-h-[3rem] sm:min-h-[5rem] rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex flex-col items-start gap-0.5 transition-all duration-200 text-left w-full",
                      isSelected
                        ? "bg-violet-600 text-white shadow-lg shadow-violet-300/50"
                        : isToday
                        ? "bg-violet-100 text-violet-700"
                        : isWeekend
                        ? "bg-violet-50/40 hover:bg-violet-100/60"
                        : "hover:bg-violet-50/60"
                    )}
                  >
                    <span className={cn(
                      "text-[11px] sm:text-sm font-semibold leading-none",
                      isSelected ? "text-white" : isToday ? "text-violet-700" : isWeekend ? "text-violet-400" : "text-foreground"
                    )}>
                      {day}
                    </span>
                    <div className="flex flex-col gap-0.5 w-full mt-0.5">
                      {dayTasks.slice(0, 2).map((t) => (
                        <div
                          key={t.id}
                          className={cn(
                            "rounded px-1 py-0.5 text-[8px] sm:text-[9px] font-medium leading-tight truncate w-full",
                            isSelected
                              ? "bg-white/20 text-white"
                              : t.priority === "high"
                              ? "bg-rose-100 text-rose-700"
                              : t.priority === "medium"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-violet-100 text-violet-600"
                          )}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className={cn("text-[8px] sm:text-[9px] font-medium pl-0.5", isSelected ? "text-white/70" : "text-muted-foreground")}>
                          +{dayTasks.length - 2} más
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 px-4 py-2 sm:py-3 border-t border-border/30 bg-muted/20">
              {[{ c: "bg-rose-500", l: "Alta" }, { c: "bg-orange-400", l: "Media" }, { c: "bg-violet-300", l: "Baja" }].map((x) => (
                <div key={x.l} className="flex items-center gap-1">
                  <div className={cn("h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full", x.c)} />
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 sm:space-y-4">
            {/* Selected date */}
            <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-4 sm:p-5 text-white shadow-lg shadow-violet-300/30">
              <p className="text-[10px] sm:text-xs font-medium text-white/60 uppercase tracking-wider">
                {selectedDay ? "Día seleccionado" : "Selecciona un día"}
              </p>
              {selectedDay && (
                <>
                  <p className="text-3xl sm:text-4xl font-bold mt-1">{selectedDay}</p>
                  <p className="text-xs sm:text-sm text-white/80 capitalize">
                    {new Date(currentYear, currentMonth, selectedDay).toLocaleDateString("es", { weekday: "long", month: "long" })}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-white/15">
                    <div className="text-center">
                      <p className="text-lg font-bold">{selectedDayTasks.length}</p>
                      <p className="text-[9px] sm:text-[10px] text-white/50">Tareas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{selectedDayTasks.filter((t) => t.status === "done").length}</p>
                      <p className="text-[9px] sm:text-[10px] text-white/50">Listas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{selectedDayTasks.filter((t) => t.priority === "high").length}</p>
                      <p className="text-[9px] sm:text-[10px] text-white/50">Urgentes</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tasks for day */}
            <div className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
              <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-violet-50/80 to-transparent border-b border-border/30">
                <h3 className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tareas del día</h3>
              </div>
              <div className="p-2.5 sm:p-3 space-y-1.5">
                {!selectedDay && <p className="text-xs text-muted-foreground text-center py-4 sm:py-6">Toca un día para ver tareas</p>}
                {selectedDay && selectedDayTasks.length === 0 && (
                  <div className="text-center py-4 sm:py-6">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-violet-50 mx-auto mb-2">
                      <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-violet-300" />
                    </div>
                    <p className="text-xs text-muted-foreground">Sin tareas</p>
                  </div>
                )}
                {selectedDayTasks.map((task) => {
                  const StatusIcon = statusIcon[task.status].icon;
                  const pCfg = priorityConfig[task.priority];
                  return (
                    <div
                      key={task.id}
                      onClick={() => setTaskToComplete(task)}
                      className={cn(
                        "rounded-xl sm:rounded-2xl p-2.5 sm:p-3 transition-all hover:shadow-md cursor-pointer border border-transparent hover:border-border/50",
                        task.status === "done" ? "bg-emerald-50/50 opacity-70" : pCfg.bg
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <StatusIcon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5 shrink-0", statusIcon[task.status].color, task.status === "in_progress" && "animate-spin")} />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs sm:text-sm font-medium leading-tight", task.status === "done" && "line-through text-muted-foreground")}>{task.title}</p>
                          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{task.companyName ?? "Tarea individual"}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={cn("text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full", pCfg.badge)}>
                              {pCfg.label}
                            </span>
                            {task.recurrence !== "none" && (
                              <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-500 flex items-center gap-0.5">
                                <Repeat className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                                {task.recurrence === "daily" ? "Diaria" : task.recurrence === "weekly" ? "Semanal" : "Mensual"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskActionDialog
        task={taskToComplete}
        open={!!taskToComplete}
        onClose={() => setTaskToComplete(null)}
        onChangeStatus={(taskId, status, obs) => {
          updateTaskStatus(taskId, status, obs);
          setTaskToComplete(null);
        }}
        onAddObservation={(taskId, text) => {
          addObservation(taskId, text);
          setTaskToComplete(null);
        }}
        onEditTask={(taskId, updates) => {
          updateTask(taskId, updates);
          setTaskToComplete(null);
        }}
      />
    </>
  );
}
