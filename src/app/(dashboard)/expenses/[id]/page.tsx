"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight as BreadcrumbSep, Loader2, Trash2, Pencil, Receipt, TrendingDown } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getExpense, deleteExpense, type Expense } from "@/lib/api/expenses";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  rent: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
  electricity: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
  salaries: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  transport: { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/20" },
  maintenance: { bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20" },
  other: { bg: "bg-muted", text: "text-foreground", border: "border-border" },
};

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canEdit = hasPermission("Expense Update");
  const canDelete = hasPermission("Expense Delete");

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchExpense() {
      try {
        const res = await getExpense(expenseId);
        setExpense(res.data);
      } catch {
        toast("Failed to load expense", "error");
        router.push("/expenses");
      } finally {
        setLoading(false);
      }
    }
    fetchExpense();
  }, [expenseId, router, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense(expenseId);
      toast("Expense deleted successfully", "success");
      router.push("/expenses");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to delete expense", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!expense) return null;

  const catStyle = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.other;
  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const itemsList = expense.items || expense.expense_items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expense Details</h1>
          <p className="mt-0.5 text-sm text-muted-foreground"><span className="font-semibold text-foreground">{expense.title}</span></p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/expenses")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">Expenses</button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">Detail</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className={`rounded-2xl border ${catStyle.border} ${catStyle.bg} p-4 sm:p-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-card border border-border shadow-sm">
              <TrendingDown className={`h-6 w-6 sm:h-7 sm:w-7 ${catStyle.text}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(expense.amount)}</p>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-bold capitalize mt-1 ${catStyle.border} ${catStyle.bg} ${catStyle.text}`}>
                {expense.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {canEdit && (
            <button onClick={() => router.push(`/expenses/${expenseId}/edit`)} className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            )}
            {canDelete && (
            <button onClick={() => setShowDeleteConfirm(true)} className="h-9 rounded-lg border border-red-500/20 bg-card px-3 text-xs font-semibold text-red-600 hover:bg-red-500/10 shadow-sm flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Category</p>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${catStyle.border} ${catStyle.bg} ${catStyle.text} mt-1`}>
              {expense.category}
            </span>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Expense Date</p>
            <p className="text-sm font-semibold text-foreground">{formatDate(expense.expense_date)}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Items</p>
            <p className="text-sm font-semibold text-foreground">{itemsList.length} item(s)</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Recorded by</p>
            <p className="text-sm font-semibold text-foreground">{expense.creator?.name || "—"}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Items Table */}
        {itemsList.length > 0 && (
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Expense Items</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">#</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Qty</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Unit Price</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {itemsList.map((item, i) => (
                    <tr key={i} className="hover:bg-accent/50 transition-colors">
                      <td className="px-5 py-3 text-sm text-muted-foreground">{i + 1}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">{item.description}</td>
                      <td className="px-5 py-3 text-right text-sm text-foreground">{item.quantity}</td>
                      <td className="px-5 py-3 text-right text-sm text-foreground">{formatCurrency(item.unit_price)}</td>
                      <td className="px-5 py-3 text-right text-sm font-semibold text-foreground">{formatCurrency(item.total_price || item.quantity * item.unit_price)}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{item.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes (Full Width) */}
        {expense.notes && (
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Notes</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{expense.notes}</p>
          </div>
        )}

        {/* Images */}
        {(expense.receipt_image || expense.bill_image) && (
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Images</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {expense.receipt_image && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Receipt</p>
                  <img src={getImageUrl(expense.receipt_image) || ""} alt="Receipt" className="h-40 w-full rounded-xl object-cover border border-border" />
                </div>
              )}
              {expense.bill_image && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Bill</p>
                  <img src={getImageUrl(expense.bill_image) || ""} alt="Bill" className="h-40 w-full rounded-xl object-cover border border-border" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="rounded-2xl border border-border bg-card px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-6 text-xs text-muted-foreground">
          <div>Created by <span className="font-semibold text-foreground">{expense.creator?.name || "—"}</span> on {formatDate(expense.created_at)}</div>
          {expense.updater && <div>Updated by <span className="font-semibold text-foreground">{expense.updater.name}</span> on {formatDate(expense.updated_at)}</div>}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-4 sm:p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Expense?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">This will permanently remove <span className="font-semibold text-foreground">{expense.title}</span>. This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-70">
                  {isDeleting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
