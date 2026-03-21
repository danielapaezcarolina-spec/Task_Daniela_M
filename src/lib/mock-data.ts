export interface Company {
  id: string;
  name: string;
  rif: string;
  phone: string;
  contactName: string;
  color: string;
  tasksTotal: number;
  tasksCompleted: number;
  pendingTasks: Task[];
  sendDailySummary: boolean;
}

export interface TaskObservation {
  id: string;
  text: string;
  date: string;
  status: Task["status"];
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
}

export interface Reminder {
  id: string;
  taskId: string;
  message: string;
  time: string;
  sent: boolean;
}

export const companies: Company[] = [
  {
    id: "1",
    name: "Inversiones ABC C.A.",
    rif: "J-12345678-9",
    phone: "+584141234567",
    contactName: "Carlos Méndez",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    tasksTotal: 8,
    tasksCompleted: 5,
    pendingTasks: [],
    sendDailySummary: true,
  },
  {
    id: "2",
    name: "Comercial El Faro S.A.",
    rif: "J-98765432-1",
    phone: "+584249876543",
    contactName: "María López",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    tasksTotal: 6,
    tasksCompleted: 2,
    pendingTasks: [],
    sendDailySummary: true,
  },
  {
    id: "3",
    name: "Servicios Delta C.A.",
    rif: "J-45678912-3",
    phone: "+584125556677",
    contactName: "Pedro Ramírez",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    tasksTotal: 4,
    tasksCompleted: 4,
    pendingTasks: [],
    sendDailySummary: false,
  },
  {
    id: "4",
    name: "Grupo Montaña LLC",
    rif: "J-11223344-5",
    phone: "+584167778899",
    contactName: "Ana Torres",
    color: "bg-violet-100 text-violet-700 border-violet-200",
    tasksTotal: 10,

    tasksCompleted: 7,
    pendingTasks: [],
    sendDailySummary: true,
  },
];

export const tasks: Task[] = [
  {
    id: "1",
    title: "Declaración de IVA",
    description: "Preparar y presentar declaración mensual de IVA",
    companyId: "1",
    companyName: "Inversiones ABC C.A.",
    priority: "high",
    status: "todo",
    recurrence: "monthly",
    dueDate: "2026-03-15",
    createdAt: "2026-03-10",
  },
  {
    id: "2",
    title: "Conciliación bancaria",
    description: "Revisar y conciliar movimientos del mes",
    companyId: "1",
    companyName: "Inversiones ABC C.A.",
    priority: "medium",
    status: "in_progress",
    recurrence: "monthly",
    dueDate: "2026-03-16",
    createdAt: "2026-03-10",
  },
  {
    id: "3",
    title: "Retenciones ISLR",
    description: "Calcular y registrar retenciones de ISLR",
    companyId: "2",
    companyName: "Comercial El Faro S.A.",
    priority: "high",
    status: "todo",
    recurrence: "monthly",
    dueDate: "2026-03-14",
    createdAt: "2026-03-08",
  },
  {
    id: "4",
    title: "Facturación mensual",
    description: "Emitir facturas pendientes del mes",
    companyId: "2",
    companyName: "Comercial El Faro S.A.",
    priority: "medium",
    status: "todo",
    recurrence: "monthly",
    dueDate: "2026-03-17",
    createdAt: "2026-03-09",
  },
  {
    id: "5",
    title: "Libro de compras",
    description: "Actualizar libro de compras del período",
    companyId: "3",
    companyName: "Servicios Delta C.A.",
    priority: "low",
    status: "done",
    recurrence: "weekly",
    dueDate: "2026-03-13",
    createdAt: "2026-03-07",
    completedAt: "2026-03-13",
  },
  {
    id: "6",
    title: "Nómina quincenal",
    description: "Procesar nómina de la segunda quincena",
    companyId: "4",
    companyName: "Grupo Montaña LLC",
    priority: "high",
    status: "in_progress",
    recurrence: "monthly",
    dueDate: "2026-03-15",
    createdAt: "2026-03-10",
  },
  {
    id: "7",
    title: "Balance de comprobación",
    description: "Generar balance de comprobación mensual",
    companyId: "4",
    companyName: "Grupo Montaña LLC",
    priority: "medium",
    status: "todo",
    recurrence: "monthly",
    dueDate: "2026-03-18",
    createdAt: "2026-03-11",
  },
  {
    id: "8",
    title: "Declaración SENIAT",
    description: "Presentar declaración ante el SENIAT",
    companyId: "1",
    companyName: "Inversiones ABC C.A.",
    priority: "high",
    status: "todo",
    recurrence: "monthly",
    dueDate: "2026-03-14",
    createdAt: "2026-03-05",
  },
  {
    id: "9",
    title: "Revisar facturas de proveedores",
    description: "Verificar y registrar facturas recibidas",
    companyId: "1",
    companyName: "Inversiones ABC C.A.",
    priority: "low",
    status: "done",
    recurrence: "daily",
    dueDate: "2026-03-17",
    createdAt: "2026-03-01",
    completedAt: "2026-03-17",
  },
  {
    id: "10",
    title: "Cierres de caja diario",
    description: "Cuadrar caja al final de cada día",
    companyId: "2",
    companyName: "Comercial El Faro S.A.",
    priority: "medium",
    status: "todo",
    recurrence: "daily",
    dueDate: "2026-03-17",
    createdAt: "2026-03-01",
  },
  {
    id: "11",
    title: "Revisión de inventario",
    description: "Verificar stock semanal",
    companyId: "4",
    companyName: "Grupo Montaña LLC",
    priority: "low",
    status: "done",
    recurrence: "weekly",
    dueDate: "2026-03-14",
    createdAt: "2026-03-07",
    completedAt: "2026-03-14",
  },
];

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

export const accountsReceivable: AccountReceivable[] = [
  { id: "ar1", companyId: "1", client: "Distribuidora Norte", concept: "Servicios contables - Febrero 2026", amount: 500, currency: "USD", issueDate: "2026-02-28", dueDate: "2026-03-15", status: "pending", amountPaid: 0 },
  { id: "ar2", companyId: "1", client: "Farmacia Central", concept: "Declaración ISLR 2025", amount: 350, currency: "USD", issueDate: "2026-01-15", dueDate: "2026-02-15", status: "overdue", amountPaid: 0 },
  { id: "ar3", companyId: "1", client: "Inversiones ABC C.A.", concept: "Auditoría trimestral Q1", amount: 1200, currency: "USD", issueDate: "2026-03-01", dueDate: "2026-04-01", status: "partial", amountPaid: 600 },
  { id: "ar4", companyId: "2", client: "Comercial El Faro S.A.", concept: "Nómina mensual Marzo", amount: 280, currency: "USD", issueDate: "2026-03-01", dueDate: "2026-03-20", status: "pending", amountPaid: 0 },
  { id: "ar5", companyId: "2", client: "Tienda Express", concept: "Facturación Enero-Febrero", amount: 450, currency: "USD", issueDate: "2026-02-01", dueDate: "2026-03-01", status: "paid", amountPaid: 450 },
  { id: "ar6", companyId: "3", client: "Servicios Delta C.A.", concept: "Cierre fiscal 2025", amount: 800, currency: "USD", issueDate: "2026-01-10", dueDate: "2026-02-10", status: "paid", amountPaid: 800 },
  { id: "ar7", companyId: "4", client: "Grupo Montaña LLC", concept: "Asesoría tributaria", amount: 600, currency: "USD", issueDate: "2026-03-05", dueDate: "2026-04-05", status: "pending", amountPaid: 0 },
  { id: "ar8", companyId: "4", client: "Constructora Sur", concept: "Balance general 2025", amount: 950, currency: "USD", issueDate: "2026-02-20", dueDate: "2026-03-20", status: "partial", amountPaid: 475 },
];

export const stats = {
  totalTasks: tasks.length,
  completed: tasks.filter((t) => t.status === "done").length,
  inProgress: tasks.filter((t) => t.status === "in_progress").length,
  pending: tasks.filter((t) => t.status === "todo").length,
  completionRate: Math.round(
    (tasks.filter((t) => t.status === "done").length / tasks.length) * 100
  ),
  urgentTasks: tasks.filter(
    (t) => t.priority === "high" && t.status !== "done"
  ).length,
};
