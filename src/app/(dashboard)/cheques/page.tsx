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
  CreditCard,
} from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import {
  getCheques,
  deleteCheque,
  type Cheque,
} from "@/lib/api/cheques";
import type { PaginatedResponse } from "@/types";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "cleared", label: "Cleared" },
  { value: "bounced", label: "Bounced" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  cleared: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  bounced: "bg-red-500/10 text-red-600 border-red-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function ChequesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canCreate = hasPermission("Cheque Create");
  const canDelete = hasPermission("Cheque Delete");
  const showActions = true; // Always show Actions column for View details button

  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Cheque> | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Cheque | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCheques = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await getCheques(params);
      if (res.status === "success") {
        setCheques(res.data.data);
        setPagination(res.data);
      }
    } catch {
      toast("Failed to load cheques", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, statusFilter, toast]);

  useEffect(() => { fetchCheques(); }, [fetchCheques]);

  const handleDelete = async (cheque: Cheque) => {
    setIsDeleting(true);
    try {
      await deleteCheque(cheque.id);
      toast("Cheque deleted successfully", "success");
      setShowDeleteConfirm(null);
      fetchCheques();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to delete cheque", "error");
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

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cheques</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage and track pending, cleared, and bounced cheques.</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/cheques/create")} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus className="mr-2 h-4 w-4" />
            Record Cheque
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by cheque number, bank, customer..."
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
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full sm:w-auto sm:min-w-[160px] rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-all hover:border-border focus:border-emerald-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
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
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cheque No.</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                {showActions && (
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 8 : 7} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Loading cheques...</p>
                  </td>
                </tr>
              ) : cheques.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 8 : 7} className="px-5 py-16 text-center">
                    <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-semibold text-foreground">No cheques found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                cheques.map((cheque, i) => (
                  <tr key={cheque.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{cheque.cheque_number}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-foreground">{cheque.customer?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{cheque.customer?.code || ""}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-foreground">{cheque.bank_name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-foreground">{formatDate(cheque.cheque_date)}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(cheque.amount)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[cheque.status] || "bg-muted text-muted-foreground border-border"}`}>
                        {cheque.status}
                      </span>
                    </td>
                    {showActions && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/cheques/${cheque.id}`)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {cheque.status !== "cleared" && canDelete && (
                            <button
                              onClick={() => setShowDeleteConfirm(cheque)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-600 transition-colors"
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
            itemLabel="cheques"
          />
        )}
      </div>

      {/* Mobile Cards */}
      {loading ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading cheques...</p>
        </div>
      ) : cheques.length === 0 ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-foreground">No cheques found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {cheques.map((cheque) => (
            <div key={cheque.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-mono font-semibold text-foreground truncate">{cheque.cheque_number}</p>
                  <p className="text-xs text-muted-foreground">{cheque.customer?.name || "—"}</p>
                </div>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLES[cheque.status] || "bg-muted text-muted-foreground border-border"}`}>
                  {cheque.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{cheque.bank_name}</span>
                <span>{formatDate(cheque.cheque_date)}</span>
                <span className="font-semibold text-foreground">{formatCurrency(cheque.amount)}</span>
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                <button onClick={() => router.push(`/cheques/${cheque.id}`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                {cheque.status !== "cleared" && canDelete && (
                  <button onClick={() => setShowDeleteConfirm(cheque)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-600 transition-colors">
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
                  <Trash2 className="h-7 w-7 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Cheque?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove cheque <span className="font-semibold text-foreground">{showDeleteConfirm.cheque_number}</span>. This action cannot be undone.
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
