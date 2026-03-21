"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import { fireNotification } from "@/lib/notifications";
import { sendWAReminder } from "@/lib/whatsapp-client";

export interface Reminder {
  id: string;
  taskId: string;
  taskTitle: string;
  companyName: string;
  message: string;
  scheduledTime: string;
  status: "pending" | "fired" | "dismissed";
  repeat: boolean;
  repeatIntervalMs: number;
  createdAt: string;
  recipientPhone?: string;
}

interface FiredNotification {
  id: string;
  reminder: Reminder;
  firedAt: string;
  visible: boolean;
}

interface ReminderContextType {
  reminders: Reminder[];
  firedNotifications: FiredNotification[];
  addReminder: (params: {
    taskId: string;
    taskTitle: string;
    companyName: string;
    message: string;
    scheduledTime: string;
    repeat?: boolean;
    repeatIntervalMs?: number;
    recipientPhone?: string;
  }) => void;
  dismissReminder: (id: string) => void;
  dismissNotification: (id: string) => void;
  snoozeReminder: (id: string, delayMs: number) => void;
}

const ReminderContext = createContext<ReminderContextType | null>(null);

export function ReminderProvider({ children }: { children: ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [firedNotifications, setFiredNotifications] = useState<FiredNotification[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const fireReminder = useCallback((reminder: Reminder) => {
    // Update status
    setReminders((prev) => prev.map((r) => r.id === reminder.id ? { ...r, status: "fired" as const } : r));

    // Fire browser notification
    fireNotification(
      `TaskConta - ${reminder.companyName}`,
      `${reminder.message}\nTarea: ${reminder.taskTitle}`,
      { taskId: reminder.taskId, reminderId: reminder.id }
    );

    // Send WhatsApp reminder with confirmation flow
    if (reminder.recipientPhone) {
      sendWAReminder({
        taskId: reminder.taskId,
        taskTitle: reminder.taskTitle,
        companyName: reminder.companyName,
        phone: reminder.recipientPhone,
        message: reminder.message,
      }).catch(() => {});
    }

    // Add to in-app notifications
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setFiredNotifications((prev) => [
      {
        id: notifId,
        reminder,
        firedAt: new Date().toISOString(),
        visible: true,
      },
      ...prev,
    ]);

    // If repeat, schedule next
    if (reminder.repeat) {
      const intervalId = setTimeout(() => {
        fireReminder({ ...reminder, status: "pending" });
      }, reminder.repeatIntervalMs);
      timersRef.current.set(reminder.id, intervalId);
    }
  }, []);

  const scheduleReminder = useCallback((reminder: Reminder) => {
    const now = Date.now();
    const target = new Date(reminder.scheduledTime).getTime();
    const delay = Math.max(0, target - now);

    // Clear existing timer
    const existing = timersRef.current.get(reminder.id);
    if (existing) clearTimeout(existing);

    const timerId = setTimeout(() => {
      fireReminder(reminder);
    }, delay);

    timersRef.current.set(reminder.id, timerId);
  }, [fireReminder]);

  const addReminder = useCallback((params: {
    taskId: string;
    taskTitle: string;
    companyName: string;
    message: string;
    scheduledTime: string;
    repeat?: boolean;
    repeatIntervalMs?: number;
    recipientPhone?: string;
  }) => {
    const reminder: Reminder = {
      id: `rem-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      taskId: params.taskId,
      taskTitle: params.taskTitle,
      companyName: params.companyName,
      message: params.message,
      scheduledTime: params.scheduledTime,
      status: "pending",
      repeat: params.repeat ?? false,
      repeatIntervalMs: params.repeatIntervalMs ?? 180000,
      createdAt: new Date().toISOString(),
      recipientPhone: params.recipientPhone,
    };

    setReminders((prev) => [...prev, reminder]);
    scheduleReminder(reminder);
  }, [scheduleReminder]);

  const dismissReminder = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setReminders((prev) => prev.map((r) => r.id === id ? { ...r, status: "dismissed" as const, repeat: false } : r));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setFiredNotifications((prev) => prev.map((n) => n.id === id ? { ...n, visible: false } : n));
  }, []);

  const snoozeReminder = useCallback((id: string, delayMs: number) => {
    const reminder = reminders.find((r) => r.id === id);
    if (!reminder) return;

    // Clear current timer
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);

    // Schedule new fire
    const newTime = new Date(Date.now() + delayMs).toISOString();
    const updated = { ...reminder, scheduledTime: newTime, status: "pending" as const };

    setReminders((prev) => prev.map((r) => r.id === id ? updated : r));
    scheduleReminder(updated);

    // Hide current notification
    setFiredNotifications((prev) => prev.map((n) => n.reminder.id === id ? { ...n, visible: false } : n));
  }, [reminders, scheduleReminder]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ReminderContext.Provider value={{ reminders, firedNotifications, addReminder, dismissReminder, dismissNotification, snoozeReminder }}>
      {children}
    </ReminderContext.Provider>
  );
}

export function useReminders() {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error("useReminders must be used within ReminderProvider");
  return ctx;
}
