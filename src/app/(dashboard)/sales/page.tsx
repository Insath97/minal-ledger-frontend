"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
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
  paid: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
  partial: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  unpaid: "bg-red-500/10 text-red-600 border border-red-500/20",
};

export default function SalesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canCreate = hasPermission("Sale Create");
  const canEdit = hasPermission("Sale Update");
  const canDelete = hasPermission("Sale Delete");
  const showActions = true;

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
          <h1 className="text-2xl font-bold text-foreground">Sales</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your sales transactions.</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/sales/create")} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Sale
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by reference, invoice, customer..."
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
            value={businessTypeFilter}
            onChange={(e) => { setBusinessTypeFilter(e.target.value as typeof businessTypeFilter); setCurrentPage(1); }}
            className="h-10 w-full sm:w-auto sm:min-w-[140px] rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-all hover:border-border focus:border-emerald-500"
          >
            <option value="all">All Types</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => { setPaymentStatusFilter(e.target.value as typeof paymentStatusFilter); setCurrentPage(1); }}
            className="h-10 w-full sm:w-auto sm:min-w-[140px] rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-all hover:border-border focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* Data Table - Desktop */}
      <div className="hidden md:block rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">#</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Reference</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="hidden lg:table-cell px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Type</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Paid</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Due</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                {showActions && (
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 10 : 9} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Loading sales...</p>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 10 : 9} className="px-5 py-16 text-center">
                    <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-semibold text-foreground">No sales found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                sales.map((sale, i) => (
                  <tr key={sale.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-mono text-xs font-semibold text-foreground">{sale.reference_number}</p>
                        {sale.invoice_number && (
                          <p className="text-xs text-muted-foreground">INV: {sale.invoice_number}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {sale.customer ? (
                        <div>
                          <p className="text-sm font-semibold text-foreground">{sale.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{sale.customer.phone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Walk-in</span>
                      )}
                    </td>
                    <td className="hidden lg:table-cell px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        sale.business_type === "wholesale"
                          ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                          : "bg-violet-500/10 text-violet-600 border border-violet-500/20"
                      }`}>
                        {sale.business_type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(sale.total_amount)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm text-foreground">{formatCurrency(sale.paid_amount)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className={`text-sm font-semibold ${sale.due_amount > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                        {formatCurrency(sale.due_amount)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${PAYMENT_STATUS_COLORS[sale.payment_status] || ""}`}>
                        {sale.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-foreground">{new Date(sale.sale_date).toLocaleDateString()}</p>
                    </td>
                    {showActions && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/sales/${sale.id}`)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => router.push(`/sales/${sale.id}/edit`)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setShowDeleteConfirm(sale)}
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
            itemLabel="sales"
          />
        )}
      </div>

      {/* Mobile Cards */}
      {loading ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading sales...</p>
        </div>
      ) : sales.length === 0 ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-foreground">No sales found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {sales.map((sale, i) => (
            <div
              key={sale.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-xs font-semibold text-foreground">{sale.reference_number}</p>
                  {sale.customer ? (
                    <p className="text-sm font-semibold text-foreground mt-0.5">{sale.customer.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-0.5">Walk-in</p>
                  )}
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${PAYMENT_STATUS_COLORS[sale.payment_status] || ""}`}>
                  {sale.payment_status}
                </span>
              </div>

              {/* Card Body - Amounts */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total</p>
                  <p className="text-sm font-bold text-foreground truncate">{formatCurrency(sale.total_amount)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Paid</p>
                  <p className="text-sm text-foreground truncate">{formatCurrency(sale.paid_amount)}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Due</p>
                  <p className={`text-sm font-semibold truncate ${sale.due_amount > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {formatCurrency(sale.due_amount)}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                    sale.business_type === "wholesale"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-violet-500/10 text-violet-600"
                  }`}>
                    {sale.business_type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(sale.sale_date).toLocaleDateString()}
                  </span>
                </div>
                {showActions && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => router.push(`/sales/${sale.id}`)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => router.push(`/sales/${sale.id}/edit`)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => setShowDeleteConfirm(sale)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Sale?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove <span className="font-semibold text-foreground">{showDeleteConfirm.reference_number}</span>. This action cannot be undone.
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
