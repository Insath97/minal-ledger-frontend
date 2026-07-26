"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  getSales,
  deleteSale,
  type Sale,
} from "@/lib/api/sales";
import type { PaginatedResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8000";

function getImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_BASE}/${path}`;
}

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  unpaid: "bg-red-100 text-red-700 border-red-200",
};

export default function SalesPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [sales, setSales] = useState<Sale[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Sale> | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [businessTypeFilter, setBusinessTypeFilter] = useState<"all" | "retail" | "wholesale">("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | "paid" | "partial" | "unpaid">("all");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Sale | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (businessTypeFilter !== "all") params.business_type = businessTypeFilter;
      if (paymentStatusFilter !== "all") params.payment_status = paymentStatusFilter;
      const res = await getSales(params);
      if (res.status === "success") {
        setSales(res.data.data);
        setPagination(res.data);
      }
    } catch {
      toast("Failed to load sales", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, businessTypeFilter, paymentStatusFilter, toast]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const handleDelete = async (sale: Sale) => {
    setIsDeleting(true);
    try {
      await deleteSale(sale.id);
      toast("Sale deleted successfully", "success");
      setShowDeleteConfirm(null);
      fetchSales();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to delete sale", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  const totalPages = pagination?.last_page ?? 1;
  const totalItems = pagination?.total ?? 0;

  const formatCurrency = (amount: number) =>
    `Rs. ${Number(amount).toLocaleString("en-US")}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your sales transactions.</p>
        </div>
        <Button onClick={() => router.push("/sales/create")} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by reference, invoice, customer..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="h-10 pl-9 pr-9 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            value={businessTypeFilter}
            onChange={(e) => { setBusinessTypeFilter(e.target.value as typeof businessTypeFilter); setCurrentPage(1); }}
            className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition-all hover:border-slate-300 focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => { setPaymentStatusFilter(e.target.value as typeof paymentStatusFilter); setCurrentPage(1); }}
            className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition-all hover:border-slate-300 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">#</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Reference</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Customer</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Total</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Paid</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Due</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
                    <p className="text-sm text-slate-500">Loading sales...</p>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16 text-center">
                    <ShoppingCart className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-600">No sales found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                sales.map((sale, i) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-400">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-mono text-xs font-semibold text-slate-700">{sale.reference_number}</p>
                        {sale.invoice_number && (
                          <p className="text-xs text-slate-400">INV: {sale.invoice_number}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {sale.customer ? (
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{sale.customer.name}</p>
                          <p className="text-xs text-slate-400">{sale.customer.phone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Walk-in</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        sale.business_type === "wholesale"
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-violet-100 text-violet-700 border border-violet-200"
                      }`}>
                        {sale.business_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(sale.total_amount)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm text-slate-600">{formatCurrency(sale.paid_amount)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className={`text-sm font-semibold ${sale.due_amount > 0 ? "text-red-600" : "text-slate-400"}`}>
                        {formatCurrency(sale.due_amount)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${PAYMENT_STATUS_COLORS[sale.payment_status] || ""}`}>
                        {sale.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-slate-600">{new Date(sale.sale_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/sales/${sale.id}`)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/sales/${sale.id}/edit`)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(sale)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && totalItems > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-xs text-slate-500">Rows per page:</p>
              <select
                value={perPage}
                onChange={(e) => handlePerPageChange(Number(e.target.value))}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-600 outline-none focus:border-emerald-500"
              >
                {PER_PAGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{pagination.from}</span>
                {" "}to{" "}
                <span className="font-semibold text-slate-700">{pagination.to}</span>
                {" "}of{" "}
                <span className="font-semibold text-slate-700">{totalItems}</span> sales
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === page
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Sale?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This will permanently remove <span className="font-semibold text-slate-700">{showDeleteConfirm.reference_number}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
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
