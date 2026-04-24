// Shared types used across the app

export interface Company {
  id: string;
  name: string;
  rif: string;
  phone: string;
  contactName: string;
  sendDailySummary: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  tasksTotal: number;
  tasksCompleted: number;
}

export interface TaskObservation {
  id: string;
  text: string;
  status: string;
  date: string;
  taskId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  companyId?: string;
  companyName?: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  recurrence: "none" | "daily" | "weekly" | "weekly_specific" | "monthly";
  weekDay?: number | null; // 0=Dom,1=Lun,2=Mar,3=Mie,4=Jue,5=Vie,6=Sab
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  completionComment?: string;
  autoReminder?: boolean;
  autoReminderTime?: string;
  observations?: TaskObservation[];
  company?: Company;
}

export interface AccountReceivable {
  id: string;
  companyId: string;
  client: string;
  concept: string;
  amount: number;
  currency: "COP" | "USD";
  issueDate: string;
  dueDate: string;
  status: "pending" | "partial" | "paid" | "overdue";
  amountPaid: number;
  notes?: string;
  company?: { id: string; name: string };
}

export interface PersonalLoan {
  id: string;
  borrower: string;
  phone?: string;
  concept: string;
  amount: number;
  currency: "COP" | "USD";
  loanDate: string;
  dueDate?: string;
  status: "pending" | "partial" | "paid";
  amountPaid: number;
  notes?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}
