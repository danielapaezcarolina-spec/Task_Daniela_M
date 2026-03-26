"use client";

import { useState } from "react";
import { useAccountsReceivable } from "@/hooks/use-accounts-receivable";
import { useLoans } from "@/hooks/use-loans";
import { useCompanies } from "@/hooks/use-companies";
import type { AccountReceivable, PersonalLoan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DollarSign,
  Plus,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Phone,
  Calendar,
  FileText,
  Trash2,
  HandCoins,
  Pencil,
} from "lucide-react";
import { cn, formatCOP } from "@/lib/utils";

type MainTab = "cuentas" | "prestamos";
type ARFilter = "all" | "pending" | "partial" | "paid" | "overdue";
type LoanFilter = "all" | "pending" | "partial" | "paid";

const arStatusConfig = {
  pending: { label: "Pendiente", color: "bg-amber-50 text-amber-700 border-amber-200" },
  partial: { label: "Parcial", color: "bg-blue-50 text-blue-700 border-blue-200" },
  paid: { label: "Pagada", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  overdue: { label: "Vencida", color: "bg-red-50 text-red-700 border-red-200" },
};

const loanStatusConfig = {
  pending: { label: "Pendiente", color: "bg-amber-50 text-amber-700 border-amber-200" },
  partial: { label: "Parcial", color: "bg-blue-50 text-blue-700 border-blue-200" },
  paid: { label: "Pagada", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function CobrosPage() {
  const { accounts, createAR, deleteAR } = useAccountsReceivable();
  const { loans, createLoan, updateLoan, deleteLoan } = useLoans();
  const { companies } = useCompanies();

  const [mainTab, setMainTab] = useState<MainTab>("cuentas");
  const [arFilter, setArFilter] = useState<ARFilter>("all");
  const [loanFilter, setLoanFilter] = useState<LoanFilter>("all");
  const [showNewAR, setShowNewAR] = useState(false);
  const [showNewLoan, setShowNewLoan] = useState(false);
  const [editingLoan, setEditingLoan] = useState<PersonalLoan | null>(null);
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  // AR form state
  const [newAR, setNewAR] = useState({
    companyId: "",
    concept: "",
    amount: "",
    currency: "COP" as "COP" | "USD",
    dueDate: new Date().toISOString().split("T")[0],
  });

  // Loan form state
  const [newLoan, setNewLoan] = useState({
    borrower: "",
    phone: "",
    concept: "",
    amount: "",
    currency: "COP" as "COP" | "USD",
    loanDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
  });

  // AR stats
  const totalPendingAR = accounts.filter((ar) => ar.status !== "paid").reduce((sum, ar) => sum + (ar.amount - ar.amountPaid), 0);
  const totalCollectedAR = accounts.reduce((sum, ar) => sum + ar.amountPaid, 0);
  const overdueCountAR = accounts.filter((ar) => ar.status === "overdue").length;

  // Loan stats
  const totalLent = loans.reduce((sum, l) => sum + l.amount, 0);
  const totalRepaid = loans.reduce((sum, l) => sum + l.amountPaid, 0);
  const pendingLoansCount = loans.filter((l) => l.status !== "paid").length;

  const filteredAR = arFilter === "all" ? accounts : accounts.filter((ar) => ar.status === arFilter);
  const filteredLoans = loanFilter === "all" ? loans : loans.filter((l) => l.status === loanFilter);

  const handleCreateAR = async () => {
    if (!newAR.concept.trim() || !newAR.amount || !newAR.companyId) return;
    const selectedCompany = companies.find((c) => c.id === newAR.companyId);
    await createAR({
      ...newAR,
      client: selectedCompany?.name || "",
      issueDate: new Date().toISOString(),
    });
    setNewAR({ companyId: "", concept: "", amount: "", currency: "COP", dueDate: new Date().toISOString().split("T")[0] });
    setShowNewAR(false);
  };

  const handleCreateLoan = async () => {
    if (!newLoan.borrower.trim() || !newLoan.concept.trim() || !newLoan.amount) return;
    await createLoan({
      ...newLoan,
      dueDate: newLoan.dueDate || undefined,
    });
    setNewLoan({ borrower: "", phone: "", concept: "", amount: "", currency: "COP", loanDate: new Date().toISOString().split("T")[0], dueDate: "", notes: "" });
    setShowNewLoan(false);
  };

  const handleUpdateLoan = async () => {
    if (!editingLoan) return;
    await updateLoan(editingLoan.id, {
      borrower: newLoan.borrower,
      phone: newLoan.phone || undefined,
      concept: newLoan.concept,
      amount: newLoan.amount,
      currency: newLoan.currency,
      loanDate: newLoan.loanDate,
      dueDate: newLoan.dueDate || undefined,
      notes: newLoan.notes || undefined,
    });
    setEditingLoan(null);
    setNewLoan({ borrower: "", phone: "", concept: "", amount: "", currency: "COP", loanDate: new Date().toISOString().split("T")[0], dueDate: "", notes: "" });
    setShowNewLoan(false);
  };

  const handlePayment = async (loan: PersonalLoan) => {
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;
    const newAmountPaid = loan.amountPaid + amount;
    const newStatus = newAmountPaid >= loan.amount ? "paid" : "partial";
    await updateLoan(loan.id, { amountPaid: newAmountPaid, status: newStatus });
    setShowPayment(null);
    setPaymentAmount("");
  };

  const startEditLoan = (loan: PersonalLoan) => {
    setEditingLoan(loan);
    setNewLoan({
      borrower: loan.borrower,
      phone: loan.phone || "",
      concept: loan.concept,
      amount: String(loan.amount),
      currency: loan.currency,
      loanDate: loan.loanDate?.split("T")[0] || "",
      dueDate: loan.dueDate?.split("T")[0] || "",
      notes: loan.notes || "",
    });
    setShowNewLoan(true);
  };

  const formatDate = (d?: string) => {
    if (!d) return "Sin fecha";
    return new Date(d).toLocaleDateString("es", { day: "numeric", month: "short", year: "numeric" });
  };

  const fmtMoney = (amount: number) => formatCOP(amount);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-foreground">Cobros</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Gestiona tus cuentas por cobrar y prestamos personales</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 rounded-xl bg-muted/50 p-1 w-fit">
        <button
          onClick={() => setMainTab("cuentas")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            mainTab === "cuentas" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <DollarSign className="h-4 w-4" />
          Cuentas por Cobrar
        </button>
        <button
          onClick={() => setMainTab("prestamos")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            mainTab === "prestamos" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <HandCoins className="h-4 w-4" />
          Prestamos Personales
        </button>
      </div>

      {/* ==================== CUENTAS POR COBRAR TAB ==================== */}
      {mainTab === "cuentas" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                Por cobrar
              </div>
              <p className="text-lg font-bold text-foreground">{formatCOP(totalPendingAR)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Cobrado
              </div>
              <p className="text-lg font-bold text-emerald-600">{formatCOP(totalCollectedAR)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Vencidas
              </div>
              <p className="text-lg font-bold text-red-600">{overdueCountAR}</p>
            </div>
          </div>

          {/* Filters + Add button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {(["all", "pending", "partial", "overdue", "paid"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setArFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    arFilter === f ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {f === "all" ? "Todas" : arStatusConfig[f].label}
                  <span className="ml-1 opacity-70">
                    {f === "all" ? accounts.length : accounts.filter((a) => a.status === f).length}
                  </span>
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => setShowNewAR(true)} className="rounded-full gap-1.5">
              <Plus className="h-4 w-4" /> Nueva cuenta
            </Button>
          </div>

          {/* New AR form */}
          {showNewAR && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Nueva cuenta por cobrar</h3>
                <button onClick={() => setShowNewAR(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Empresa</Label>
                  <select
                    value={newAR.companyId}
                    onChange={(e) => setNewAR({ ...newAR, companyId: e.target.value })}
                    className="w-full mt-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar empresa...</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Concepto</Label>
                  <Input value={newAR.concept} onChange={(e) => setNewAR({ ...newAR, concept: e.target.value })} placeholder="Concepto del cobro" className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Monto</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={newAR.amount ? formatCOP(parseFloat(newAR.amount) || 0) : ""}
                      onChange={(e) => setNewAR({ ...newAR, amount: e.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="$0"
                      className="mt-1"
                    />
                  </div>
                  <div className="w-20">
                    <Label className="text-xs">Moneda</Label>
                    <select
                      value={newAR.currency}
                      onChange={(e) => setNewAR({ ...newAR, currency: e.target.value as "COP" | "USD" })}
                      className="w-full mt-1 rounded-lg border border-input bg-background px-2 py-2 text-sm"
                    >
                      <option value="COP">COP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Fecha de vencimiento</Label>
                  <Input type="date" value={newAR.dueDate} onChange={(e) => setNewAR({ ...newAR, dueDate: e.target.value })} className="mt-1" />
                </div>
              </div>
              <Button size="sm" onClick={handleCreateAR} className="rounded-full">Crear cuenta</Button>
            </div>
          )}

          {/* AR list */}
          <div className="space-y-2">
            {filteredAR.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No hay cuentas por cobrar</div>
            ) : (
              filteredAR.map((ar) => (
                <div key={ar.id} className="group rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{ar.company?.name || ar.client}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", arStatusConfig[ar.status].color)}>
                          {arStatusConfig[ar.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 ml-6">{ar.concept}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">{fmtMoney(ar.amount)}</p>
                      {ar.amountPaid > 0 && (
                        <p className="text-[11px] text-emerald-600">Pagado: {fmtMoney(ar.amountPaid)}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(ar.dueDate)}
                      </p>
                    </div>
                  </div>
                  {ar.status === "partial" && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(ar.amountPaid / ar.amount) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{Math.round((ar.amountPaid / ar.amount) * 100)}% pagado</p>
                    </div>
                  )}
                  <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteAR(ar.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ==================== PRESTAMOS PERSONALES TAB ==================== */}
      {mainTab === "prestamos" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <HandCoins className="h-3.5 w-3.5" />
                Total prestado
              </div>
              <p className="text-lg font-bold text-foreground">{formatCOP(totalLent)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Devuelto
              </div>
              <p className="text-lg font-bold text-emerald-600">{formatCOP(totalRepaid)}</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Pendientes
              </div>
              <p className="text-lg font-bold text-amber-600">{pendingLoansCount}</p>
            </div>
          </div>

          {/* Filters + Add button */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex gap-1 flex-wrap">
              {(["all", "pending", "partial", "paid"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setLoanFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    loanFilter === f ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {f === "all" ? "Todos" : loanStatusConfig[f].label}
                  <span className="ml-1 opacity-70">
                    {f === "all" ? loans.length : loans.filter((l) => l.status === f).length}
                  </span>
                </button>
              ))}
            </div>
            <Button size="sm" onClick={() => { setEditingLoan(null); setNewLoan({ borrower: "", phone: "", concept: "", amount: "", currency: "COP", loanDate: new Date().toISOString().split("T")[0], dueDate: "", notes: "" }); setShowNewLoan(true); }} className="rounded-full gap-1.5">
              <Plus className="h-4 w-4" /> Nuevo prestamo
            </Button>
          </div>

          {/* New/Edit Loan form */}
          {showNewLoan && (
            <div className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{editingLoan ? "Editar prestamo" : "Nuevo prestamo"}</h3>
                <button onClick={() => { setShowNewLoan(false); setEditingLoan(null); }}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Nombre de quien recibe</Label>
                  <Input value={newLoan.borrower} onChange={(e) => setNewLoan({ ...newLoan, borrower: e.target.value })} placeholder="Nombre completo" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Telefono (opcional)</Label>
                  <Input value={newLoan.phone} onChange={(e) => setNewLoan({ ...newLoan, phone: e.target.value })} placeholder="+57..." className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Concepto</Label>
                  <Input value={newLoan.concept} onChange={(e) => setNewLoan({ ...newLoan, concept: e.target.value })} placeholder="Motivo del prestamo" className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-xs">Monto</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={newLoan.amount ? formatCOP(parseFloat(newLoan.amount) || 0) : ""}
                      onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value.replace(/[^0-9]/g, "") })}
                      placeholder="$0"
                      className="mt-1"
                    />
                  </div>
                  <div className="w-24">
                    <Label className="text-xs">Moneda</Label>
                    <select
                      value={newLoan.currency}
                      onChange={(e) => setNewLoan({ ...newLoan, currency: e.target.value as "COP" | "USD" })}
                      className="w-full mt-1 rounded-lg border border-input bg-background px-2 py-2 text-sm"
                    >
                      <option value="COP">COP</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Fecha del prestamo</Label>
                  <Input type="date" value={newLoan.loanDate} onChange={(e) => setNewLoan({ ...newLoan, loanDate: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Fecha de pago esperada (opcional)</Label>
                  <Input type="date" value={newLoan.dueDate} onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })} className="mt-1" />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Notas (opcional)</Label>
                  <Textarea value={newLoan.notes} onChange={(e) => setNewLoan({ ...newLoan, notes: e.target.value })} placeholder="Detalles adicionales..." className="mt-1" rows={2} />
                </div>
              </div>
              <Button size="sm" onClick={editingLoan ? handleUpdateLoan : handleCreateLoan} className="rounded-full">
                {editingLoan ? "Guardar cambios" : "Registrar prestamo"}
              </Button>
            </div>
          )}

          {/* Loans list */}
          <div className="space-y-2">
            {filteredLoans.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">No hay prestamos registrados</div>
            ) : (
              filteredLoans.map((loan) => (
                <div key={loan.id} className="group rounded-xl border bg-card p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{loan.borrower}</span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border", loanStatusConfig[loan.status].color)}>
                          {loanStatusConfig[loan.status].label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 ml-6">{loan.concept}</p>
                      {loan.phone && (
                        <div className="flex items-center gap-1 mt-1 ml-6">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{loan.phone}</span>
                        </div>
                      )}
                      {loan.notes && (
                        <div className="flex items-center gap-1 mt-1 ml-6">
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[11px] text-muted-foreground">{loan.notes}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">{fmtMoney(loan.amount)}</p>
                      {loan.amountPaid > 0 && (
                        <p className="text-[11px] text-emerald-600">Devuelto: {fmtMoney(loan.amountPaid)}</p>
                      )}
                      {loan.amount - loan.amountPaid > 0 && loan.amountPaid > 0 && (
                        <p className="text-[11px] text-amber-600">Resta: {fmtMoney(loan.amount - loan.amountPaid)}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {formatDate(loan.loanDate)}
                      </p>
                      {loan.dueDate && (
                        <p className="text-[10px] text-muted-foreground">Vence: {formatDate(loan.dueDate)}</p>
                      )}
                    </div>
                  </div>

                  {loan.status === "partial" && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(loan.amountPaid / loan.amount) * 100}%` }} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{Math.round((loan.amountPaid / loan.amount) * 100)}% devuelto</p>
                    </div>
                  )}

                  {/* Payment inline form */}
                  {showPayment === loan.id && (
                    <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="$0"
                        value={paymentAmount ? formatCOP(parseFloat(paymentAmount) || 0) : ""}
                        onChange={(e) => setPaymentAmount(e.target.value.replace(/[^0-9]/g, ""))}
                        className="h-8 text-sm flex-1"
                      />
                      <Button size="sm" className="h-8 rounded-full text-xs" onClick={() => handlePayment(loan)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Abonar
                      </Button>
                      <button onClick={() => { setShowPayment(null); setPaymentAmount(""); }}>
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {loan.status !== "paid" && (
                      <button onClick={() => { setShowPayment(loan.id); setPaymentAmount(""); }} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Abonar
                      </button>
                    )}
                    <button onClick={() => startEditLoan(loan)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      <Pencil className="h-3 w-3" /> Editar
                    </button>
                    <button onClick={() => deleteLoan(loan.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
