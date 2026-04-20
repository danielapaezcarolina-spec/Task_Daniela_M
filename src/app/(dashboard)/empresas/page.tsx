"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanies } from "@/hooks/use-companies";
import { useTasks } from "@/context/task-context";
import { useNotificationRules } from "@/hooks/use-notification-rules";
import type { Company } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewCompanyDialog } from "@/components/popups/new-company-dialog";
import {
  Building2,
  Plus,
  Search,
  ArrowUpRight,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const cardStyles = [
  { bg: "from-emerald-100/80 via-teal-50 to-emerald-50", iconBg: "bg-white/70 text-emerald-500", accent: "bg-emerald-400" },
  { bg: "from-orange-100/80 via-amber-50 to-orange-50", iconBg: "bg-white/70 text-orange-500", accent: "bg-orange-400" },
  { bg: "from-rose-100/80 via-pink-50 to-rose-50", iconBg: "bg-white/70 text-rose-500", accent: "bg-rose-400" },
  { bg: "from-violet-100/80 via-purple-50 to-violet-50", iconBg: "bg-white/70 text-violet-500", accent: "bg-violet-400" },
];

export default function EmpresasPage() {
  const { tasks } = useTasks();
  const { companies, createCompany, updateCompany, deleteCompany } = useCompanies();
  const { addCompanyRule, updateCompanyRule, companyRules } = useNotificationRules();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await deleteCompany(id);
    setDeleteId(null);
  };

  const handleCreate = async (data: Parameters<typeof createCompany>[0], daysBefore?: number) => {
    const company = await createCompany(data);
    if (daysBefore !== undefined) addCompanyRule(company.id, company.name, daysBefore);
  };

  const handleEdit = async (data: Parameters<typeof updateCompany>[1], daysBefore?: number) => {
    if (!editCompany) return;
    await updateCompany(editCompany.id, data);
    if (daysBefore !== undefined) {
      const existing = companyRules.find((r) => r.companyId === editCompany.id);
      if (existing) updateCompanyRule(existing.id, { daysBefore });
      else addCompanyRule(editCompany.id, editCompany.name, daysBefore);
    }
  };

  return (
    <>
      <NewCompanyDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onCreate={handleCreate}
      />
      <NewCompanyDialog
        open={!!editCompany}
        onClose={() => setEditCompany(null)}
        mode="edit"
        initialData={editCompany ? { name: editCompany.name, rif: editCompany.rif, phone: editCompany.phone, contactName: editCompany.contactName } : undefined}
        initialDays={editCompany ? (companyRules.find((r) => r.companyId === editCompany.id)?.daysBefore ?? 3) : 3}
        onCreate={handleEdit}
      />

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Empresas</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Gestiona tus empresas y sus tareas</p>
      </div>

      <div className="py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 bg-card border-border/50 rounded-full text-xs sm:text-sm"
            />
          </div>
          <Button size="sm" className="rounded-full shadow-md shadow-primary/25 gap-1.5 h-8 px-3 text-xs" onClick={() => setShowDialog(true)}>
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Nueva Empresa</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredCompanies.map((company, index) => {
            const style = cardStyles[index % cardStyles.length];
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();
            const companyTasks = tasks.filter((t) => t.companyId === company.id);
            const monthTasks = companyTasks.filter((t) => {
              const d = new Date(t.dueDate);
              return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
            const monthTotal = monthTasks.length;
            const monthDone = monthTasks.filter((t) => t.status === "done").length;
            const monthPending = monthTotal - monthDone;
            const progress = monthTotal > 0 ? Math.round((monthDone / monthTotal) * 100) : 0;
            const monthName = now.toLocaleDateString("es", { month: "short" });

            return (
              <div key={company.id} className="group relative rounded-2xl sm:rounded-3xl bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                {/* Action buttons on hover */}
                <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditCompany(company); }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow hover:bg-violet-50 transition-colors"
                  >
                    <Pencil className="h-3 w-3 text-violet-500" />
                  </button>
                  {deleteId === company.id ? (
                    <div className="flex items-center gap-0.5 bg-white/90 rounded-full px-1.5 shadow">
                      <span className="text-[9px] text-rose-700 font-medium">¿Eliminar?</span>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(company.id); }} className="text-[9px] font-bold text-rose-700 px-0.5">Sí</button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(null); }} className="text-[9px] text-muted-foreground px-0.5">No</button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(company.id); }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3 w-3 text-rose-500" />
                    </button>
                  )}
                </div>

                <div
                  onClick={() => router.push(`/empresas/${company.id}`)}
                  className="cursor-pointer"
                >
                  <div className={cn("relative h-28 sm:h-40 bg-linear-to-br flex items-center justify-center", style.bg)}>
                    <span className="absolute top-2 left-2 bg-foreground/80 text-card text-[8px] sm:text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                      {monthPending} pendientes
                    </span>
                    <div className={cn("absolute top-2 right-2 flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full shadow-sm backdrop-blur-sm group-hover:opacity-0 transition-opacity", style.iconBg)}>
                      <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                    <Building2 className="h-10 w-10 sm:h-14 sm:w-14 opacity-[0.06]" />
                  </div>

                  <div className="p-2.5 sm:p-4">
                    <h4 className="font-bold text-xs sm:text-sm text-foreground leading-tight mb-0.5 truncate">{company.name}</h4>
                    <p className="text-[9px] sm:text-[11px] text-muted-foreground/60 mb-2 sm:mb-3 capitalize">{monthDone}/{monthTotal} en {monthName}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-[10px] sm:text-[11px] font-bold rounded-full px-2 py-0.5",
                          progress >= 75 ? "bg-emerald-100 text-emerald-700" :
                          progress >= 40 ? "bg-orange-100 text-orange-700" :
                          "bg-rose-100 text-rose-700"
                        )}>{progress}%</span>
                        <div className="w-10 sm:w-14 h-1 rounded-full bg-muted hidden sm:block">
                          <div className={cn("h-1 rounded-full transition-all", progress >= 75 ? "bg-emerald-400" : progress >= 40 ? "bg-orange-400" : "bg-rose-400")} style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-foreground text-card group-hover:bg-primary transition-colors">
                        <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add */}
          <button onClick={() => setShowDialog(true)} className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-violet-200/60 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary hover:bg-violet-50/30 transition-all duration-300 min-h-[200px] sm:min-h-[280px]">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-violet-50">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-violet-400" />
            </div>
            <span className="text-[10px] sm:text-xs font-medium">Agregar Empresa</span>
          </button>
        </div>
      </div>
    </>
  );
}
