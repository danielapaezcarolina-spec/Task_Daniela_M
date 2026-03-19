"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { tasks as initialTasks, type Task } from "@/lib/mock-data";

interface TaskContextType {
  tasks: Task[];
  completeTask: (id: string, comment?: string) => void;
  updateTaskStatus: (id: string, status: Task["status"]) => void;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const completeTask = useCallback((id: string, comment?: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "done" as const,
              completedAt: new Date().toISOString().split("T")[0],
              completionComment: comment || undefined,
            }
          : t
      )
    );
  }, []);

  const updateTaskStatus = useCallback((id: string, status: Task["status"]) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status,
              completedAt: status === "done" ? new Date().toISOString().split("T")[0] : undefined,
              completionComment: status === "done" ? t.completionComment : undefined,
            }
          : t
      )
    );
  }, []);

  return (
    <TaskContext.Provider value={{ tasks, completeTask, updateTaskStatus }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
}
