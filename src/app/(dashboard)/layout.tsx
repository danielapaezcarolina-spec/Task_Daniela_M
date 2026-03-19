"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { TaskProvider } from "@/context/task-context";
import { TopNavbar } from "@/components/layout/top-navbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DailyTasksPopup } from "@/components/popups/daily-tasks-popup";

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
      <div className="min-h-screen bg-background">
        <TopNavbar />
        <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-24 md:pb-8 pt-2">
          {children}
        </main>
        <MobileNav />
        <DailyTasksPopup open={showDailyPopup} onClose={handleClosePopup} />
      </div>
    </TaskProvider>
  );
}
