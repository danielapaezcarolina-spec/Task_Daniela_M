"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { tasks as tasksApi } from "@/lib/api";
import type { Task } from "@/lib/types";

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  completeTask: (id: string, comment?: string) => void;
  updateTaskStatus: (id: string, status: Task["status"], observation?: string) => void;
  addObservation: (id: string, text: string) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "dueDate" | "recurrence">>) => void;
  createTask: (data: { title: string; description?: string; priority?: string; recurrence?: string; dueDate: string; companyId: string }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTasks = useCallback(async () => {
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch {
      // API not available, keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const addObservation = useCallback(async (id: string, text: string) => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const obs = { id: `obs-${Date.now()}`, text, date: new Date().toISOString(), status: t.status, taskId: id };
        return { ...t, observations: [...(t.observations || []), obs] };
      })
    );
    await tasksApi.update(id, { observation: text }).catch(() => refreshTasks());
  }, [refreshTasks]);

  const completeTask = useCallback(async (id: string, comment?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, status: "done" as const, completedAt: new Date().toISOString().split("T")[0], completionComment: comment } : t
      )
    );
    await tasksApi.update(id, {
      status: "done",
      completedAt: new Date().toISOString(),
      completionComment: comment,
      observation: comment || "Tarea completada",
    }).catch(() => refreshTasks());
  }, [refreshTasks]);

  const updateTaskStatus = useCallback(async (id: string, status: Task["status"], observation?: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status,
          completedAt: status === "done" ? new Date().toISOString().split("T")[0] : t.completedAt,
        };
      })
    );
    await tasksApi.update(id, {
      status,
      completedAt: status === "done" ? new Date().toISOString() : undefined,
      observation: observation || `Estado cambiado a: ${status === "todo" ? "Inicio" : status === "in_progress" ? "En proceso" : "Finalizada"}`,
    }).catch(() => refreshTasks());
  }, [refreshTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "dueDate" | "recurrence">>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
    await tasksApi.update(id, { ...updates, observation: "Tarea editada" }).catch(() => refreshTasks());
  }, [refreshTasks]);

  const createTask = useCallback(async (data: { title: string; description?: string; priority?: string; recurrence?: string; dueDate: string; companyId: string }) => {
    const task = await tasksApi.create(data);
    setTasks((prev) => [...prev, task]);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await tasksApi.delete(id).catch(() => refreshTasks());
  }, [refreshTasks]);

  return (
    <TaskContext.Provider value={{ tasks, loading, completeTask, updateTaskStatus, addObservation, updateTask, createTask, deleteTask, refreshTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
