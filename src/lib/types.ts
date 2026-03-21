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
  companyId: string;
  companyName: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "done";
  recurrence: "none" | "daily" | "weekly" | "monthly";
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  completionComment?: string;
  observations?: TaskObservation[];
  company?: Company;
}

export interface AccountReceivable {
  id: string;
  companyId: string;
  client: string;
  concept: string;
  amount: number;
  currency: "USD" | "BS";
  issueDate: string;
  dueDate: string;
  status: "pending" | "partial" | "paid" | "overdue";
  amountPaid: number;
  notes?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}
