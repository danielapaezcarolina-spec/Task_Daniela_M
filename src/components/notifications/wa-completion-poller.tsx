"use client";

import { useEffect } from "react";
import { useTasks } from "@/context/task-context";
import { useReminders } from "@/context/reminder-context";
import { pollTaskCompletions } from "@/lib/whatsapp-client";
import { fireNotification } from "@/lib/notifications";

export function WACompletionPoller() {
  const { refreshTasks } = useTasks();
  const { dismissReminder, reminders } = useReminders();

  useEffect(() => {
    const interval = setInterval(async () => {
      const completions = await pollTaskCompletions();
      let shouldRefresh = false;

      for (const c of completions) {
        shouldRefresh = true;

        // Dismiss any active reminders for this task so no more WA follow-ups fire
        reminders
          .filter((r) => r.taskId === c.taskId && r.status !== "dismissed")
          .forEach((r) => dismissReminder(r.id));

        // Notify in-app
        fireNotification(
          "Tarea completada via WhatsApp ✅",
          `La tarea fue confirmada desde WhatsApp`,
          { taskId: c.taskId }
        );
      }

      if (shouldRefresh) {
        await refreshTasks();
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [refreshTasks, dismissReminder, reminders]);

  return null;
}
