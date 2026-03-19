"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressSection } from "@/components/dashboard/progress-section";
import { CompanyCards } from "@/components/dashboard/company-cards";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Greeting } from "@/components/dashboard/greeting";

export default function DashboardPage() {
  return (
    <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
      <Greeting />
      <StatsCards />

      {/* On mobile: single column, everything stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <ProgressSection />
          <CompanyCards />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <QuickActions />
          <RecentTasks />
        </div>
      </div>
    </div>
  );
}
