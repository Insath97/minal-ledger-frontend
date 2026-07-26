"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight as BreadcrumbSep, Loader2, Trash2, Pencil, Receipt, TrendingDown } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getExpense, deleteExpense, type Expense } from "@/lib/api/expenses";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  rent: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  electricity: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  salaries: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  transport: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  maintenance: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  other: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
};

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = Number(params.id);
  const { toast } = useToast();

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
        <div className="h-10 w-40 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!expense) return null;

  const catStyle = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.other;
  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expense Details</h1>
          <p className="mt-0.5 text-sm text-slate-500"><span className="font-semibold text-slate-700">{expense.title}</span></p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/expenses")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Expenses</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Detail</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className={`rounded-2xl border ${catStyle.border} ${catStyle.bg} p-6 shadow-sm`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 border border-white/50 shadow-sm">
              <TrendingDown className={`h-7 w-7 ${catStyle.text}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
            </div>
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${catStyle.border} ${catStyle.bg} ${catStyle.text}`}>
              {expense.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push(`/expenses/${expenseId}/edit`)} className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="h-9 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50 shadow-sm flex items-center gap-1.5">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Expense Date</p>
            <p className="text-sm font-semibold text-slate-700">{formatDate(expense.expense_date)}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Items</p>
            <p className="text-sm font-semibold text-slate-700">{expense.items?.length || 0} item(s)</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Recorded by</p>
            <p className="text-sm font-semibold text-slate-700">{expense.creator?.name || "—"}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Items Table */}
        {expense.items && expense.items.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700">Expense Items</h3>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">#</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Qty</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Unit Price</th>
                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Total</th>
                    <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {expense.items.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3 text-sm text-slate-400">{i + 1}</td>
                      <td className="px-5 py-3 text-sm font-medium text-slate-700">{item.description}</td>
                      <td className="px-5 py-3 text-right text-sm text-slate-600">{item.quantity}</td>
                      <td className="px-5 py-3 text-right text-sm text-slate-600">{formatCurrency(item.unit_price)}</td>
                      <td className="px-5 py-3 text-right text-sm font-semibold text-slate-800">{formatCurrency(item.total_price || item.quantity * item.unit_price)}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">{item.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes */}
        {expense.notes && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Notes</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{expense.notes}</p>
          </div>
        )}

        {/* Images */}
        {(expense.receipt_image || expense.bill_image) && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Images</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {expense.receipt_image && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Receipt</p>
                  <img src={getImageUrl(expense.receipt_image) || ""} alt="Receipt" className="h-40 w-full rounded-xl object-cover border border-slate-200" />
                </div>
              )}
              {expense.bill_image && (
                <div>
                  <p className="text-xs text-slate-500 mb-2">Bill</p>
                  <img src={getImageUrl(expense.bill_image) || ""} alt="Bill" className="h-40 w-full rounded-xl object-cover border border-slate-200" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-wrap gap-6 text-xs text-slate-500">
          <div>Created by <span className="font-semibold text-slate-700">{expense.creator?.name || "—"}</span> on {formatDate(expense.created_at)}</div>
          {expense.updater && <div>Updated by <span className="font-semibold text-slate-700">{expense.updater.name}</span> on {formatDate(expense.updated_at)}</div>}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Expense?</h3>
                <p className="text-sm text-slate-500">This will permanently remove <span className="font-semibold text-slate-700">{expense.title}</span>.</p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
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
