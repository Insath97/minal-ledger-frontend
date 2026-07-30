"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  X,
  Loader2,
  ArrowDownRight,
} from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import {
  getPayments,
  deletePayment,
  type Payment,
} from "@/lib/api/payments";
import type { PaginatedResponse } from "@/types";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

const PAYMENT_METHODS = [
  { value: "", label: "All Methods" },
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
];

const METHOD_STYLES: Record<string, string> = {
  cash: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  credit_card: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  bank_transfer: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  cheque: "bg-amber-500/10 text-amber-600 border-amber-500/20",
};

export default function PaymentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canCreate = hasPermission("Payment Create");
  const canDelete = hasPermission("Payment Delete");
  const showActions = true; // Always show Actions column for View details button

  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Payment> | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [methodFilter, setMethodFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Payment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (methodFilter) params.payment_method = methodFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await getPayments(params);
      if (res.status === "success") {
        setPayments(res.data.data);
        setPagination(res.data);
      }
    } catch {
      toast("Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, methodFilter, dateFrom, dateTo, toast]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleDelete = async (payment: Payment) => {
    setIsDeleting(true);
    try {
      await deletePayment(payment.id);
      toast("Payment deleted and allocations reversed", "success");
      setShowDeleteConfirm(null);
      fetchPayments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to delete payment", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setMethodFilter("");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const totalPages = pagination?.last_page ?? 1;
  const totalItems = pagination?.total ?? 0;

  const formatCurrency = (amount: number) =>
    `Rs. ${Number(amount).toLocaleString("en-US")}`;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const formatMethod = (method: string) =>
    method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track customer payments and FIFO allocations.</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/payments/create")} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer, notes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="h-10 pl-9 pr-9 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full sm:w-auto sm:min-w-[150px] rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-all hover:border-border focus:border-emerald-500"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full sm:w-[150px] text-sm"
            placeholder="From"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full sm:w-[150px] text-sm"
            placeholder="To"
          />
          {(search || methodFilter || dateFrom || dateTo) && (
            <button onClick={clearFilters} className="h-10 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-accent">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Data Table - Desktop */}
      <div className="hidden md:block rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">#</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Method</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Allocations</th>
                {showActions && (
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 7 : 6} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Loading payments...</p>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 7 : 6} className="px-5 py-16 text-center">
                    <ArrowDownRight className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-semibold text-foreground">No payments found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                payments.map((payment, i) => (
                  <tr key={payment.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-foreground">{payment.customer?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{payment.customer?.code || ""}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(payment.total_amount)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${METHOD_STYLES[payment.payment_method] || "bg-muted text-muted-foreground border-border"}`}>
                        {formatMethod(payment.payment_method)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-foreground">{formatDate(payment.payment_date)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-foreground">{(payment.payment_sales || payment.paymentSales || []).length} sale(s)</p>
                    </td>
                    {showActions && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/payments/${payment.id}`)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setShowDeleteConfirm(payment)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            from={pagination.from}
            to={pagination.to}
            perPage={perPage}
            perPageOptions={PER_PAGE_OPTIONS}
            onPageChange={setCurrentPage}
            onPerPageChange={handlePerPageChange}
            itemLabel="payments"
          />
        )}
      </div>

      {/* Mobile Cards */}
      {loading ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <ArrowDownRight className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-foreground">No payments found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="rounded-2xl border border-border bg-background p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{payment.customer?.name || "—"}</p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize mt-1 ${METHOD_STYLES[payment.payment_method] || "bg-muted text-muted-foreground border-border"}`}>
                    {formatMethod(payment.payment_method)}
                  </span>
                </div>
                <p className="text-sm font-bold text-emerald-600 shrink-0 ml-2">{formatCurrency(payment.total_amount)}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{formatDate(payment.payment_date)}</span>
                <span>{(payment.payment_sales || payment.paymentSales || []).length} sale(s)</span>
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                <button onClick={() => router.push(`/payments/${payment.id}`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                {canDelete && (
                  <button onClick={() => setShowDeleteConfirm(payment)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-4 sm:p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Payment?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove payment of <span className="font-semibold text-foreground">{formatCurrency(showDeleteConfirm.total_amount)}</span> and reverse all sale allocations. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isDeleting}
                  className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-70"
                >
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
