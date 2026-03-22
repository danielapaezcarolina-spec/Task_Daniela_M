import type { Task, Company, AccountReceivable, AppUser } from "./types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("Unauthorized");
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Auth
export const auth = {
  check: () => request<{ user: AppUser | null }>("/api/auth"),
  login: (pin: string) => request<{ user: AppUser }>("/api/auth", { method: "POST", body: JSON.stringify({ pin }) }),
  logout: () => request<{ success: boolean }>("/api/auth", { method: "DELETE" }),
};

// Tasks
function mapTask(t: Record<string, unknown>): Task {
  const company = t.company as Record<string, unknown> | undefined;
  return {
    ...t,
    companyName: company?.name as string || "",
    dueDate: typeof t.dueDate === "string" ? t.dueDate.split("T")[0] : "",
    createdAt: typeof t.createdAt === "string" ? t.createdAt.split("T")[0] : "",
    completedAt: t.completedAt ? (t.completedAt as string).split("T")[0] : undefined,
  } as Task;
}

export const tasks = {
  list: async (companyId?: string) => {
    const url = companyId ? `/api/tasks?companyId=${companyId}` : "/api/tasks";
    const data = await request<Record<string, unknown>[]>(url);
    return data.map(mapTask);
  },
  create: (data: {
    title: string;
    description?: string;
    priority?: string;
    recurrence?: string;
    dueDate: string;
    companyId: string;
  }) => request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(data) }).then(t => mapTask(t as unknown as Record<string, unknown>)),

  update: (id: string, data: Record<string, unknown>) =>
    request<Task>("/api/tasks", { method: "PATCH", body: JSON.stringify({ id, ...data }) }).then(t => mapTask(t as unknown as Record<string, unknown>)),

  delete: (id: string) => request<{ deleted: boolean }>(`/api/tasks?id=${id}`, { method: "DELETE" }),
};

// Companies
export const companies = {
  list: () => request<Company[]>("/api/companies"),
  create: (data: { name: string; rif: string; phone: string; contactName: string; sendDailySummary?: boolean }) =>
    request<Company>("/api/companies", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<Company>("/api/companies", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => request<{ deleted: boolean }>(`/api/companies?id=${id}`, { method: "DELETE" }),
};

// Accounts Receivable
export const accountsReceivable = {
  list: (companyId?: string) => {
    const url = companyId ? `/api/accounts-receivable?companyId=${companyId}` : "/api/accounts-receivable";
    return request<AccountReceivable[]>(url);
  },
  create: (data: Record<string, unknown>) =>
    request<AccountReceivable>("/api/accounts-receivable", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    request<AccountReceivable>("/api/accounts-receivable", { method: "PATCH", body: JSON.stringify({ id, ...data }) }),
  delete: (id: string) => request<{ deleted: boolean }>(`/api/accounts-receivable?id=${id}`, { method: "DELETE" }),
};
