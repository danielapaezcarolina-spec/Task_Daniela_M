"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { tasks as initialTasks, type Task, type TaskObservation } from "@/lib/mock-data";

interface TaskContextType {
  tasks: Task[];
  completeTask: (id: string, comment?: string) => void;
  updateTaskStatus: (id: string, status: Task["status"], observation?: string) => void;
  addObservation: (id: string, text: string) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "dueDate" | "recurrence">>) => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const addObservation = useCallback((id: string, text: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const obs: TaskObservation = {
          id: `obs-${Date.now()}`,
          text,
          date: new Date().toISOString(),
          status: t.status,
        };
        return { ...t, observations: [...(t.observations || []), obs] };
      })
    );
  }, []);

  const completeTask = useCallback((id: string, comment?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const obs: TaskObservation = {
          id: `obs-${Date.now()}`,
          text: comment || "Tarea completada",
          date: new Date().toISOString(),
          status: "done",
        };
        return {
          ...t,
          status: "done" as const,
          completedAt: new Date().toISOString().split("T")[0],
          completionComment: comment || undefined,
          observations: [...(t.observations || []), obs],
        };
      })
    );
  }, []);

  const updateTaskStatus = useCallback((id: string, status: Task["status"], observation?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const obs: TaskObservation = {
          id: `obs-${Date.now()}`,
          text: observation || `Estado cambiado a: ${status === "todo" ? "Inicio" : status === "in_progress" ? "En proceso" : "Finalizada"}`,
          date: new Date().toISOString(),
          status,
        };
        return {
          ...t,
          status,
          completedAt: status === "done" ? new Date().toISOString().split("T")[0] : t.completedAt,
          observations: [...(t.observations || []), obs],
        };
      })
    );
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "dueDate" | "recurrence">>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const obs: TaskObservation = {
          id: `obs-${Date.now()}`,
          text: "Tarea editada",
          date: new Date().toISOString(),
          status: t.status,
        };
        return { ...t, ...updates, observations: [...(t.observations || []), obs] };
      })
    );
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, completeTask, updateTaskStatus, addObservation, updateTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
