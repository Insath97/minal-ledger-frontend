"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronRight as BreadcrumbSep, Loader2, Trash2, CheckCircle, XCircle, Ban, CreditCard } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getCheque, updateChequeStatus, deleteCheque, type Cheque } from "@/lib/api/cheques";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  cleared: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  bounced: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  cancelled: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" },
};

export default function ChequeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const chequeId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canDelete = hasPermission("Cheque Delete");
  const canUpdateStatus = hasPermission("Cheque Update Status");

  const [cheque, setCheque] = useState<Cheque | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState<"cleared" | "bounced" | "cancelled" | null>(null);
  const [clearanceDate, setClearanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [statusNotes, setStatusNotes] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    async function fetchCheque() {
      try {
        const res = await getCheque(chequeId);
        setCheque(res.data);
      } catch {
        toast("Failed to load cheque", "error");
        router.push("/cheques");
      } finally {
        setLoading(false);
      }
    }
    fetchCheque();
  }, [chequeId, router, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCheque(chequeId);
      toast("Cheque deleted successfully", "success");
      router.push("/cheques");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to delete cheque", "error");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!showStatusModal) return;
    setIsUpdatingStatus(true);
    try {
      await updateChequeStatus(chequeId, {
        status: showStatusModal,
        clearance_date: showStatusModal === "cleared" ? clearanceDate : undefined,
        notes: statusNotes || undefined,
      });
      toast(`Cheque marked as ${showStatusModal.toUpperCase()}`, "success");
      setShowStatusModal(null);
      setStatusNotes("");
      const res = await getCheque(chequeId);
      setCheque(res.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string; errors?: Array<{ field: string; messages: string[] }> } } };
      const backendErrors = error.response?.data?.errors;
      if (backendErrors && Array.isArray(backendErrors)) {
        backendErrors.forEach((e) => {
          if (e.messages && e.messages.length > 0) toast(e.messages[0], "error");
        });
      } else {
        toast(error.response?.data?.message || "Failed to update status", "error");
      }
    } finally {
      setIsUpdatingStatus(false);
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

  if (!cheque) return null;

  const statusStyle = STATUS_STYLES[cheque.status] || STATUS_STYLES.pending;
  const formatCurrency = (amount: number) => `Rs. ${Number(amount).toLocaleString("en-US")}`;
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cheque Details</h1>
          <p className="mt-0.5 text-sm text-slate-500">Cheque <span className="font-mono font-semibold text-slate-700">{cheque.cheque_number}</span></p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/cheques")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Cheques</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Detail</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className={`rounded-2xl border ${statusStyle.border} ${statusStyle.bg} p-4 sm:p-6 shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-white/80 border border-white/50 shadow-sm">
              <CreditCard className={`h-6 w-6 sm:h-7 sm:w-7 ${statusStyle.text}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Cheque Number</p>
              <p className="text-base sm:text-lg font-bold text-slate-900 font-mono truncate">{cheque.cheque_number}</p>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] sm:text-xs font-bold capitalize mt-1 ${statusStyle.border} ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                {cheque.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {cheque.status === "pending" && canUpdateStatus && (
              <>
                <button
                  onClick={() => setShowStatusModal("cleared")}
                  className="h-9 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> Mark Cleared
                </button>
                <button
                  onClick={() => setShowStatusModal("bounced")}
                  className="h-9 rounded-lg bg-red-500 px-3 text-xs font-semibold text-white hover:bg-red-600 shadow-sm flex items-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" /> Mark Bounced
                </button>
                <button
                  onClick={() => setShowStatusModal("cancelled")}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 shadow-sm flex items-center gap-1.5"
                >
                  <Ban className="h-3.5 w-3.5" /> Cancel
                </button>
              </>
            )}
            {cheque.status !== "cleared" && canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="h-9 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 hover:bg-red-50 shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Amount</p>
            <p className="text-lg font-bold text-slate-900">{formatCurrency(cheque.amount)}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Bank</p>
            <p className="text-sm font-semibold text-slate-700">{cheque.bank_name}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Cheque Date</p>
            <p className="text-sm font-semibold text-slate-700">{formatDate(cheque.cheque_date)}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-white/50 p-3">
            <p className="text-xs text-slate-500">Clearance Date</p>
            <p className="text-sm font-semibold text-slate-700">{cheque.clearance_date ? formatDate(cheque.clearance_date) : "—"}</p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Customer Information</h3>
          {cheque.customer ? (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Name</span><span className="text-sm font-semibold text-slate-700">{cheque.customer.name}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Code</span><span className="text-sm font-mono text-slate-700">{cheque.customer.code}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-500">Phone</span><span className="text-sm text-slate-700">{cheque.customer.phone}</span></div>
              {cheque.customer.outstanding_balance !== undefined && (
                <div className="flex justify-between"><span className="text-sm text-slate-500">Outstanding</span><span className="text-sm font-semibold text-slate-700">{formatCurrency(cheque.customer.outstanding_balance)}</span></div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No customer linked</p>
          )}
        </div>

        {/* Sale Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Linked Sale</h3>
          {cheque.sale ? (
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-500">Reference</span><span className="text-sm font-mono font-semibold text-slate-700">{cheque.sale.reference_number}</span></div>
              {cheque.sale.total_amount !== undefined && <div className="flex justify-between"><span className="text-sm text-slate-500">Total</span><span className="text-sm font-semibold text-slate-700">{formatCurrency(cheque.sale.total_amount)}</span></div>}
              {cheque.sale.due_amount !== undefined && <div className="flex justify-between"><span className="text-sm text-slate-500">Due</span><span className="text-sm font-semibold text-red-600">{formatCurrency(cheque.sale.due_amount)}</span></div>}
              {cheque.sale.payment_status && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className={`text-xs font-semibold capitalize ${cheque.sale.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{cheque.sale.payment_status}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No sale linked</p>
          )}
        </div>

        {/* Cheque Image */}
        {cheque.cheque_image && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Cheque Image</h3>
            <img src={getImageUrl(cheque.cheque_image) || ""} alt="Cheque" className="h-40 w-full max-w-md rounded-xl object-cover border border-slate-200" />
          </div>
        )}

        {/* Notes */}
        {cheque.notes && (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">Notes</h3>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{cheque.notes}</p>
          </div>
        )}
      </div>

      {/* Timestamps */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-6 text-xs text-slate-500">
          <div>Created by <span className="font-semibold text-slate-700">{cheque.creator?.name || "—"}</span> on {formatDate(cheque.created_at)}</div>
          {cheque.updater && <div>Updated by <span className="font-semibold text-slate-700">{cheque.updater.name}</span> on {formatDate(cheque.updated_at)}</div>}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-4 sm:p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Cheque?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">This will permanently remove cheque <span className="font-semibold text-slate-700">{cheque.cheque_number}</span>. This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-70">
                  {isDeleting ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStatusModal(null)} />
          <div className="relative z-10 w-full max-w-md mx-4">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className={`h-1.5 ${showStatusModal === "cleared" ? "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" : showStatusModal === "bounced" ? "bg-gradient-to-r from-red-500 via-red-400 to-red-500" : "bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500"}`} />
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Mark Cheque as {showStatusModal.charAt(0).toUpperCase() + showStatusModal.slice(1)}
                </h3>
                {showStatusModal === "cleared" && (
                  <div className="space-y-2 mb-4">
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Clearance Date <span className="text-red-500">*</span></label>
                    <input type="date" value={clearanceDate} onChange={(e) => setClearanceDate(e.target.value)} className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Notes</label>
                  <textarea value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} placeholder="Optional notes..." rows={3} className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button onClick={() => setShowStatusModal(null)} className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleStatusUpdate} disabled={isUpdatingStatus || (showStatusModal === "cleared" && !clearanceDate)} className={`flex-1 h-11 rounded-xl text-white text-sm font-semibold shadow-lg disabled:opacity-70 ${
                  showStatusModal === "cleared" ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" : showStatusModal === "bounced" ? "bg-red-500 hover:bg-red-600 shadow-red-500/25" : "bg-slate-500 hover:bg-slate-600 shadow-slate-500/20"
                }`}>
                  {isUpdatingStatus ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : `Mark ${showStatusModal.charAt(0).toUpperCase() + showStatusModal.slice(1)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
