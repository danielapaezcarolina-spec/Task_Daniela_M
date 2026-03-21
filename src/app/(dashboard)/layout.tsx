"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { TaskProvider } from "@/context/task-context";
import { ReminderProvider } from "@/context/reminder-context";
import { TopNavbar } from "@/components/layout/top-navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DailyTasksPopup } from "@/components/popups/daily-tasks-popup";
import { NotificationToast } from "@/components/notifications/notification-toast";
import { PermissionBanner } from "@/components/notifications/permission-banner";
import { WACompletionPoller } from "@/components/notifications/wa-completion-poller";
import { registerServiceWorker } from "@/lib/notifications";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, justLoggedIn, clearJustLoggedIn } = useAuth();
  const router = useRouter();
  const [showDailyPopup, setShowDailyPopup] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (justLoggedIn) {
      const timer = setTimeout(() => setShowDailyPopup(true), 400);
      return () => clearTimeout(timer);
    }
  }, [justLoggedIn]);

  const handleClosePopup = () => {
    setShowDailyPopup(false);
    clearJustLoggedIn();
  };

  if (!isAuthenticated) return null;

  return (
    <TaskProvider>
      <ReminderProvider>
        <div className="min-h-screen bg-background">
          <TopNavbar />
          <PermissionBanner />
          <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-24 md:pb-8 pt-2">
            {children}
          </main>
          <MobileNav />
          <DailyTasksPopup open={showDailyPopup} onClose={handleClosePopup} />
          <NotificationToast />
          <WACompletionPoller />
        </div>
      </ReminderProvider>
    </TaskProvider>
  );
}
