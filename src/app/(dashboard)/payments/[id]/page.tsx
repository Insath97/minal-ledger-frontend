"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight as BreadcrumbSep, Loader2, Trash2, ArrowDownRight, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getPayment, deletePayment, type Payment } from "@/lib/api/payments";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  cash: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  credit_card: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  bank_transfer: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  cheque: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canDelete = hasPermission("Payment Delete");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchPayment() {
      try {
        const res = await getPayment(paymentId);
        setPayment(res.data);
      } catch {
        toast("Failed to load payment", "error");
        router.push("/payments");
      } finally {
        setLoading(false);
      }
    }
    fetchPayment();
  }, [paymentId, router, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePayment(paymentId);
      toast("Payment deleted and allocations reversed", "success");
      router.push("/payments");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to delete payment", "error");
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

  if (!payment) return null;

  const methodStyle = METHOD_STYLES[payment.payment_method] || METHOD_STYLES.cash;
  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const formatMethod = (method: string) => method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  
  const allocations = payment.payment_sales || payment.paymentSales || [];
  const totalAllocated = allocations.reduce((sum, ps) => sum + Number(ps.allocated_amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Details</h1>
          <p className="mt-0.5 text-sm text-slate-500">Payment to <span className="font-semibold text-slate-700">{payment.customer?.name || "—"}</span></p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/payments")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Payments</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Detail</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className={`rounded-2xl border ${methodStyle.border} ${methodStyle.bg} p-6 shadow-sm`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 border border-white/50 shadow-sm">
              <ArrowDownRight className={`h-7 w-7 ${methodStyle.text}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(payment.total_amount)}</p>
            </div>
          </div>
          {canDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-9 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50 shadow-sm flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Method</p>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${methodStyle.border} ${methodStyle.bg} ${methodStyle.text} mt-1`}>
              {formatMethod(payment.payment_method)}
            </span>
          </div>
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Payment Date</p>
            <p className="text-sm font-semibold text-slate-700">{formatDate(payment.payment_date)}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Total Allocated</p>
            <p className="text-sm font-bold text-emerald-600">{formatCurrency(totalAllocated)}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Sales Linked</p>
            <p className="text-sm font-semibold text-slate-700">{allocations.length}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Customer Information</h3>
          {payment.customer ? (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Name</span><span className="text-sm font-semibold text-slate-700">{payment.customer.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Code</span><span className="text-sm font-mono text-slate-700">{payment.customer.code}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Phone</span><span className="text-sm text-slate-700">{payment.customer.phone}</span></div>
              {payment.customer.outstanding_balance !== undefined && (
                <div className="flex justify-between"><span className="text-sm text-slate-500">Outstanding</span><span className="text-sm font-semibold text-slate-700">{formatCurrency(payment.customer.outstanding_balance)}</span></div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No customer info</p>
          )}
        </div>

        {/* Linked Cheque */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Linked Cheque</h3>
          {payment.cheque ? (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Cheque No.</span><span className="text-sm font-mono font-semibold text-slate-700">{payment.cheque.cheque_number}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Bank</span><span className="text-sm text-slate-700">{payment.cheque.bank_name}</span></div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No cheque linked</p>
          )}
        </div>

        {/* Proof Image */}
        {payment.proof_image_path && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Proof Image</h3>
            <img src={getImageUrl(payment.proof_image_path) || ""} alt="Proof" className="h-40 w-full max-w-md rounded-xl object-cover border border-slate-200" />
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Notes</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{payment.notes}</p>
          </div>
        )}
      </div>

      {/* Sale Allocations */}
      {allocations.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">FIFO Sale Allocations</h3>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Sale Reference</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Sale Total</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Allocated</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Due Before</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allocations.map((ps) => {
                  const sale = ps.sale;
                  return (
                    <tr key={ps.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <button onClick={() => router.push(`/sales/${sale?.id}`)} className="text-sm font-mono font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                          {sale?.reference_number || "—"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm text-slate-600">{sale ? formatCurrency(sale.total_amount) : "—"}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(ps.allocated_amount)}</span>
                      </td>
                    <td className="px-5 py-3 text-right">
                      {sale && (() => {
                        const dueBefore = Number(sale.due_amount) + Number(ps.allocated_amount);
                        return (
                          <span className={`text-sm font-semibold ${dueBefore > 0 ? "text-red-600" : "text-emerald-600"}`}>
                            {formatCurrency(dueBefore)}
                          </span>
                        );
                      })()}
                    </td>
                      <td className="px-5 py-3">
                        {sale && (
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${sale.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" : sale.payment_status === "partial" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                            {sale.payment_status === "paid" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {sale.payment_status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex flex-wrap gap-6 text-xs text-slate-500">
          <div>Recorded by <span className="font-semibold text-slate-700">{payment.creator?.name || "—"}</span> on {formatDate(payment.created_at)}</div>
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
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Payment?</h3>
                <p className="text-sm text-slate-500">This will delete payment of <span className="font-semibold text-slate-700">{formatCurrency(payment.total_amount)}</span> and reverse all sale allocations.</p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-70">
                  {isDeleting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Delete & Reverse"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
