"use client";

import { useEffect } from "react";
import { useTasks } from "@/context/task-context";
import { useReminders } from "@/context/reminder-context";
import { pollTaskCompletions } from "@/lib/whatsapp-client";
import { fireNotification } from "@/lib/notifications";

export function WACompletionPoller() {
  const { updateTaskStatus } = useTasks();
  const { dismissReminder, reminders } = useReminders();

  useEffect(() => {
    const interval = setInterval(async () => {
      const completions = await pollTaskCompletions();
      for (const c of completions) {
        // Mark task as done
        updateTaskStatus(c.taskId, "done", "Completada via WhatsApp");

        // Dismiss any active reminders for this task
        reminders
          .filter((r) => r.taskId === c.taskId && r.status !== "dismissed")
          .forEach((r) => dismissReminder(r.id));

        // Notify in-app
        fireNotification(
          "Tarea completada via WhatsApp",
          `La tarea fue confirmada como completada desde WhatsApp`,
          { taskId: c.taskId }
        );
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [updateTaskStatus, dismissReminder, reminders]);

  return null;
}
