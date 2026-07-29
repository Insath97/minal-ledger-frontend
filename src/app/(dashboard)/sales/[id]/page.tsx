"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  ShoppingCart,
  Edit,
  Trash2,
  ChevronRight as BreadcrumbSep,
  User,
  Calendar,
  CreditCard,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Banknote,
  Image as ImageIcon,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { getSale, deleteSale, type Sale } from "@/lib/api/sales";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  unpaid: "bg-red-100 text-red-700 border-red-200",
};

const METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  cash: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  credit_card: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  bank_transfer: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  cheque: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
};

export default function ViewSalePage() {
  const router = useRouter();
  const params = useParams();
  const saleId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canEdit = hasPermission("Sale Update");
  const canDelete = hasPermission("Sale Delete");
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchSale() {
      try {
        const res = await getSale(saleId);
        setSale(res.data);
      } catch {
        toast("Failed to load sale", "error");
        router.push("/sales");
      } finally {
        setLoading(false);
      }
    }
    fetchSale();
  }, [saleId, router, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteSale(saleId);
      toast("Sale deleted successfully", "success");
      router.push("/sales");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to delete sale", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-7 w-40 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-2xl bg-slate-100 h-36 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingCart className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Sale not found</p>
        <Button onClick={() => router.push("/sales")} className="mt-4" variant="outline">
          Back to Sales
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) =>
    `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sale Details</h1>
          <p className="mt-0.5 text-sm text-slate-500">View sale information and payment status.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/sales")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            Sales
          </button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">{sale.reference_number}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{sale.reference_number}</h2>
              <div className="mt-1 flex items-center gap-3">
                {sale.invoice_number && (
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    INV: {sale.invoice_number}
                  </Badge>
                )}
                <Badge className={`text-xs font-semibold ${PAYMENT_STATUS_COLORS[sale.payment_status] || ""}`}>
                  {sale.payment_status === "paid" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                  {sale.payment_status === "unpaid" && <XCircle className="mr-1 h-3 w-3" />}
                  {sale.payment_status === "partial" && <Clock className="mr-1 h-3 w-3" />}
                  {sale.payment_status}
                </Badge>
                <Badge variant="outline" className={`text-xs font-semibold capitalize ${
                  sale.business_type === "wholesale"
                    ? "border-blue-200 bg-blue-100 text-blue-700"
                    : "border-violet-200 bg-violet-100 text-violet-700"
                }`}>
                  {sale.business_type}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
            <Button
              onClick={() => router.push(`/sales/${sale.id}/edit`)}
              className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-md shadow-emerald-600/20"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            )}
            {canDelete && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 font-semibold"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <Banknote className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(sale.total_amount)}</p>
              <p className="text-xs text-slate-500">Total Amount</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(sale.paid_amount)}</p>
              <p className="text-xs text-slate-500">Paid Amount</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${sale.due_amount > 0 ? "text-red-600" : "text-slate-900"}`}>{formatCurrency(sale.due_amount)}</p>
              <p className="text-xs text-slate-500">Due Amount</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
              <Calendar className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{new Date(sale.sale_date).toLocaleDateString()}</p>
              <p className="text-xs text-slate-500">Sale Date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Customer Information
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="flex items-center justify-between px-5 py-2.5">
              <span className="text-xs text-slate-500">Name</span>
              <span className="text-sm text-slate-700">{sale.customer?.name || "Walk-in"}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-2.5">
              <span className="text-xs text-slate-500">Phone</span>
              <span className="text-sm text-slate-700">{sale.customer?.phone || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-2.5">
              <span className="text-xs text-slate-500">Code</span>
              <span className="text-sm text-slate-700 font-mono">{sale.customer?.code || "—"}</span>
            </div>
          </div>
        </div>

        {/* Sale Info */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Sale Information
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            <div className="flex items-center justify-between px-5 py-2.5">
              <span className="text-xs text-slate-500">Reference</span>
              <span className="text-sm text-slate-700 font-mono">{sale.reference_number}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-2.5">
              <span className="text-xs text-slate-500">Invoice</span>
              <span className="text-sm text-slate-700">{sale.invoice_number || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-2.5">
              <span className="text-xs text-slate-500">Created By</span>
              <span className="text-sm text-slate-700">{sale.creator?.name || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Image */}
      {sale.bill_image && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              Bill Image
            </h2>
          </div>
          <div className="px-5 py-3">
            <img src={getImageUrl(sale.bill_image) || ""} alt="Bill" className="h-32 rounded-lg object-cover border border-slate-200" />
          </div>
        </div>
      )}

      {/* Cheques */}
      {sale.cheques && sale.cheques.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Cheque Deposits ({sale.cheques.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {sale.cheques.map((cheque) => (
              <div key={cheque.id} className="px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700 font-mono">{cheque.cheque_number}</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(cheque.amount)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Bank: {cheque.bank_name}</span>
                  <span>Date: {new Date(cheque.cheque_date).toLocaleDateString()}</span>
                  <span className={`capitalize font-semibold ${cheque.status === "cleared" ? "text-emerald-600" : cheque.status === "bounced" ? "text-red-600" : "text-amber-600"}`}>
                    {cheque.status}
                  </span>
                </div>
                {cheque.cheque_image && (
                  <img src={getImageUrl(cheque.cheque_image) || ""} alt="Cheque" className="mt-2 h-16 w-24 rounded-lg object-cover border border-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Settlements */}
      {sale.payment_sales && sale.payment_sales.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-emerald-600" />
              Payment Settlements ({sale.payment_sales.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {sale.payment_sales.map((ps) => {
              const payment = ps.payment;
              const method = payment?.payment_method || "";
              const methodStyle = METHOD_STYLES[method] || METHOD_STYLES.cash;
              return (
                <div key={ps.id} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${methodStyle.border} ${methodStyle.bg} ${methodStyle.text}`}>
                        {method.replace("_", " ")}
                      </span>
                      {payment?.payment_date && (
                        <span className="text-xs text-slate-500">{new Date(payment.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">Allocated</span>
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(ps.allocated_amount)}</span>
                    </div>
                  </div>
                  {payment?.notes && (
                    <p className="text-xs text-slate-500 mt-1">{payment.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {sale.notes && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Notes
            </h2>
          </div>
          <div className="px-5 py-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{sale.notes}</p>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span>Created: {new Date(sale.created_at).toLocaleString()} · Updated: {new Date(sale.updated_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Sale?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This will permanently remove <span className="font-semibold text-slate-700">{sale.reference_number}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-70"
                >
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
