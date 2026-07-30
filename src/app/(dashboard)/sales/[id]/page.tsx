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
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  partial: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  unpaid: "bg-red-500/10 text-red-600 border-red-500/20",
};

const METHOD_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  cash: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  credit_card: { bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
  bank_transfer: { bg: "bg-violet-500/10", text: "text-violet-600", border: "border-violet-500/20" },
  cheque: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/20" },
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
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-2xl bg-muted h-36 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-semibold text-foreground">Sale not found</p>
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sale Details</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">View sale information and payment status.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/sales")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">
            Sales
          </button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">{sale.reference_number}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 shrink-0">
              <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{sale.reference_number}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {sale.invoice_number && (
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
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
                    ? "border-blue-500/20 bg-blue-500/10 text-blue-600"
                    : "border-violet-500/20 bg-violet-500/10 text-violet-600"
                }`}>
                  {sale.business_type}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
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
              className="border-red-500/20 text-red-600 hover:bg-red-500/10 font-semibold"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Banknote className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(sale.total_amount)}</p>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(sale.paid_amount)}</p>
              <p className="text-xs text-muted-foreground">Paid Amount</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${sale.due_amount > 0 ? "text-red-600" : "text-foreground"}`}>{formatCurrency(sale.due_amount)}</p>
              <p className="text-xs text-muted-foreground">Due Amount</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
              <Calendar className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{new Date(sale.sale_date).toLocaleDateString()}</p>
              <p className="text-xs text-muted-foreground">Sale Date</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              Customer Information
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Name</span>
              <span className="text-sm text-foreground truncate ml-4 text-right">{sale.customer?.name || "Walk-in"}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Phone</span>
              <span className="text-sm text-foreground">{sale.customer?.phone || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Code</span>
              <span className="text-sm text-foreground font-mono">{sale.customer?.code || "—"}</span>
            </div>
          </div>
        </div>

        {/* Sale Info */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Sale Information
            </h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Reference</span>
              <span className="text-sm text-foreground font-mono">{sale.reference_number}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Invoice</span>
              <span className="text-sm text-foreground">{sale.invoice_number || "—"}</span>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              <span className="text-xs text-muted-foreground">Created By</span>
              <span className="text-sm text-foreground">{sale.creator?.name || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Image */}
      {sale.bill_image && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              Bill Image
            </h2>
          </div>
          <div className="px-4 sm:px-5 py-3">
            <img src={getImageUrl(sale.bill_image) || ""} alt="Bill" className="h-32 rounded-lg object-cover border border-border" />
          </div>
        </div>
      )}

      {/* Cheques */}
      {sale.cheques && sale.cheques.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Cheque Deposits ({sale.cheques.length})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {sale.cheques.map((cheque) => (
              <div key={cheque.id} className="px-4 sm:px-5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground font-mono">{cheque.cheque_number}</span>
                  <span className="text-sm font-bold text-foreground">{formatCurrency(cheque.amount)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>Bank: {cheque.bank_name}</span>
                  <span>Date: {new Date(cheque.cheque_date).toLocaleDateString()}</span>
                  <span className={`capitalize font-semibold ${cheque.status === "cleared" ? "text-emerald-600" : cheque.status === "bounced" ? "text-red-600" : "text-amber-600"}`}>
                    {cheque.status}
                  </span>
                </div>
                {cheque.cheque_image && (
                  <img src={getImageUrl(cheque.cheque_image) || ""} alt="Cheque" className="mt-2 h-16 w-24 rounded-lg object-cover border border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Settlements */}
      {sale.payment_sales && sale.payment_sales.length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-emerald-600" />
              Payment Settlements ({sale.payment_sales.length})
            </h2>
          </div>
          <div className="divide-y divide-border">
            {sale.payment_sales.map((ps) => {
              const payment = ps.payment;
              const method = payment?.payment_method || "";
              const methodStyle = METHOD_STYLES[method] || METHOD_STYLES.cash;
              return (
                <div key={ps.id} className="px-4 sm:px-5 py-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${methodStyle.border} ${methodStyle.bg} ${methodStyle.text}`}>
                        {method.replace("_", " ")}
                      </span>
                      {payment?.payment_date && (
                        <span className="text-xs text-muted-foreground">{new Date(payment.payment_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">Allocated</span>
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(ps.allocated_amount)}</span>
                    </div>
                  </div>
                  {payment?.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{payment.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      {sale.notes && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-5 py-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-600" />
              Notes
            </h2>
          </div>
          <div className="px-4 sm:px-5 py-3">
            <p className="text-sm text-foreground whitespace-pre-wrap">{sale.notes}</p>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>Created: {new Date(sale.created_at).toLocaleDateString()} {new Date(sale.created_at).toLocaleTimeString()}</span>
            <span className="hidden sm:inline">·</span>
            <span>Updated: {new Date(sale.updated_at).toLocaleDateString()} {new Date(sale.updated_at).toLocaleTimeString()}</span>
          </div>
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
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Sale?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove <span className="font-semibold text-foreground">{sale.reference_number}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted"
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
