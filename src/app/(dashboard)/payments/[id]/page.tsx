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
  cash: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  credit_card: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
  bank_transfer: { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/20" },
  cheque: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
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
        <div className="h-10 w-40 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Details</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Payment to <span className="font-semibold text-foreground">{payment.customer?.name || "—"}</span></p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/payments")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">Payments</button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">Detail</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className={`rounded-2xl border ${methodStyle.border} ${methodStyle.bg} p-4 sm:p-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-card border border-border shadow-sm">
              <ArrowDownRight className={`h-6 w-6 sm:h-7 sm:w-7 ${methodStyle.text}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{formatCurrency(payment.total_amount)}</p>
            </div>
          </div>
          {canDelete && (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-9 rounded-lg border border-red-500/20 bg-card px-3 text-xs font-semibold text-red-600 hover:bg-red-500/10 shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Method</p>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${methodStyle.border} ${methodStyle.bg} ${methodStyle.text} mt-1`}>
              {formatMethod(payment.payment_method)}
            </span>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Payment Date</p>
            <p className="text-sm font-semibold text-foreground">{formatDate(payment.payment_date)}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Total Allocated</p>
            <p className="text-sm font-bold text-emerald-600">{formatCurrency(totalAllocated)}</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Sales Linked</p>
            <p className="text-sm font-semibold text-foreground">{allocations.length}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Customer Information</h3>
          {payment.customer ? (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-semibold text-foreground">{payment.customer.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Code</span><span className="text-sm font-mono text-foreground">{payment.customer.code}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Phone</span><span className="text-sm text-foreground">{payment.customer.phone}</span></div>
              {payment.customer.outstanding_balance !== undefined && (
                <div className="flex justify-between"><span className="text-sm text-muted-foreground">Outstanding</span><span className="text-sm font-semibold text-foreground">{formatCurrency(payment.customer.outstanding_balance)}</span></div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No customer info</p>
          )}
        </div>

        {/* Linked Cheque */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Linked Cheque</h3>
          {payment.cheque ? (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Cheque No.</span><span className="text-sm font-mono font-semibold text-foreground">{payment.cheque.cheque_number}</span></div>
              <div className="flex justify-between"><span className="text-sm text-muted-foreground">Bank</span><span className="text-sm text-foreground">{payment.cheque.bank_name}</span></div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No cheque linked</p>
          )}
        </div>

        {/* Proof Image */}
        {payment.proof_image_path && (
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Proof Image</h3>
            <img src={getImageUrl(payment.proof_image_path) || ""} alt="Proof" className="h-40 w-full max-w-md rounded-xl object-cover border border-border" />
          </div>
        )}

        {/* Notes */}
        {payment.notes && (
          <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Notes</h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">{payment.notes}</p>
          </div>
        )}
      </div>

      {/* Sale Allocations */}
      {allocations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">FIFO Sale Allocations</h3>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sale Reference</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Sale Total</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Allocated</th>
                  <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Due Before</th>
                  <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allocations.map((ps) => {
                  const sale = ps.sale;
                  return (
                    <tr key={ps.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-5 py-3">
                        <button onClick={() => router.push(`/sales/${sale?.id}`)} className="text-sm font-mono font-semibold text-emerald-600 hover:text-emerald-600 hover:underline">
                          {sale?.reference_number || "—"}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm text-foreground">{sale ? formatCurrency(sale.total_amount) : "—"}</span>
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
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${sale.payment_status === "paid" ? "bg-emerald-500/10 text-emerald-600" : sale.payment_status === "partial" ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"}`}>
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
      <div className="rounded-2xl border border-border bg-card px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-6 text-xs text-muted-foreground">
          <div>Recorded by <span className="font-semibold text-foreground">{payment.creator?.name || "—"}</span> on {formatDate(payment.created_at)}</div>
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
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Payment?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">This will permanently remove payment of <span className="font-semibold text-foreground">{formatCurrency(payment.total_amount)}</span> and reverse all sale allocations. This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
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
