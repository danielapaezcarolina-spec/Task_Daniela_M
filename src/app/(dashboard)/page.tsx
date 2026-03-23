"use client";

import { useState } from "react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProgressSection } from "@/components/dashboard/progress-section";
import { CompanyCards } from "@/components/dashboard/company-cards";
import { RecentTasks } from "@/components/dashboard/recent-tasks";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Greeting } from "@/components/dashboard/greeting";
import { NewTaskDialog } from "@/components/popups/new-task-dialog";
import { NewCompanyDialog } from "@/components/popups/new-company-dialog";
import { useTasks } from "@/context/task-context";
import { useCompanies } from "@/hooks/use-companies";
import { useNotificationRules } from "@/hooks/use-notification-rules";

export default function DashboardPage() {
  const { createTask } = useTasks();
  const { companies, createCompany } = useCompanies();
  const { addCompanyRule } = useNotificationRules();
  const [showNewTask, setShowNewTask] = useState(false);
  const [showNewCompany, setShowNewCompany] = useState(false);

  const handleCreateCompany = async (data: Parameters<typeof createCompany>[0], daysBefore?: number) => {
    const company = await createCompany(data);
    if (daysBefore !== undefined) addCompanyRule(company.id, company.name, daysBefore);
  };

  return (
    <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
      <NewTaskDialog
        open={showNewTask}
        onClose={() => setShowNewTask(false)}
        onCreateTask={createTask}
        companies={companies}
      />
      <NewCompanyDialog
        open={showNewCompany}
        onClose={() => setShowNewCompany(false)}
        onCreate={handleCreateCompany}
      />

      <Greeting />
      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <ProgressSection />
          <CompanyCards />
        </div>

        <div className="space-y-4 sm:space-y-6">
          <QuickActions
            onNewTask={() => setShowNewTask(true)}
            onNewCompany={() => setShowNewCompany(true)}
          />
          <RecentTasks />
        </div>
      </div>
    </div>
  );
}
