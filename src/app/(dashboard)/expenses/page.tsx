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
  Receipt,
} from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import {
  getExpenses,
  deleteExpense,
  type Expense,
} from "@/lib/api/expenses";
import type { PaginatedResponse } from "@/types";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "rent", label: "Rent" },
  { value: "electricity", label: "Electricity" },
  { value: "salaries", label: "Salaries" },
  { value: "transport", label: "Transport" },
  { value: "maintenance", label: "Maintenance" },
  { value: "other", label: "Other" },
];

const CATEGORY_STYLES: Record<string, string> = {
  rent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  electricity: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  salaries: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  transport: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  maintenance: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  other: "bg-muted text-muted-foreground border-border",
};

export default function ExpensesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canCreate = hasPermission("Expense Create");
  const canEdit = hasPermission("Expense Update");
  const canDelete = hasPermission("Expense Delete");
  const showActions = true;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Expense> | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await getExpenses(params);
      if (res.status === "success") {
        setExpenses(res.data.data);
        setPagination(res.data);
      }
    } catch {
      toast("Failed to load expenses", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, categoryFilter, dateFrom, dateTo, toast]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleDelete = async (expense: Expense) => {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      toast("Expense deleted successfully", "success");
      setShowDeleteConfirm(null);
      fetchExpenses();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast(error.response?.data?.message || "Failed to delete expense", "error");
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
    setCategoryFilter("");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage business expenses.</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/expenses/create")} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title, notes..."
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
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            className="h-10 w-full sm:w-auto sm:min-w-[150px] rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-all hover:border-border focus:border-emerald-500"
          >
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }} className="h-10 w-full sm:w-[150px] text-sm" />
          <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }} className="h-10 w-full sm:w-[150px] text-sm" />
          {(search || categoryFilter || dateFrom || dateTo) && (
            <button onClick={clearFilters} className="h-10 rounded-lg border border-border bg-background px-3 text-xs font-medium text-muted-foreground hover:bg-accent">Clear Filters</button>
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
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Title</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Items</th>
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
                    <p className="text-sm text-muted-foreground">Loading expenses...</p>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 7 : 6} className="px-5 py-16 text-center">
                    <Receipt className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-semibold text-foreground">No expenses found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                expenses.map((expense, i) => (
                  <tr key={expense.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-foreground">{expense.title}</p>
                      {expense.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{expense.notes}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${CATEGORY_STYLES[expense.category] || "bg-muted text-foreground border-border"}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <p className="text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-foreground">{formatDate(expense.expense_date)}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-foreground">{(expense.items || expense.expense_items || []).length}</p>
                    </td>
                    {showActions && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => router.push(`/expenses/${expense.id}`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          {canEdit && (
                            <button onClick={() => router.push(`/expenses/${expense.id}/edit`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors" title="Edit">
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setShowDeleteConfirm(expense)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Delete">
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
            itemLabel="expenses"
          />
        )}
      </div>

      {/* Mobile Cards */}
      {loading ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading expenses...</p>
        </div>
      ) : expenses.length === 0 ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Receipt className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-foreground">No expenses found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="rounded-2xl border border-border bg-background p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{expense.title}</p>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize mt-1 ${CATEGORY_STYLES[expense.category] || "bg-muted text-foreground border-border"}`}>
                    {expense.category}
                  </span>
                </div>
                <p className="text-sm font-bold text-red-600 shrink-0 ml-2">{formatCurrency(expense.amount)}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{formatDate(expense.expense_date)}</span>
                <span>{(expense.items || expense.expense_items || []).length} item(s)</span>
              </div>

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                <button onClick={() => router.push(`/expenses/${expense.id}`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                {canEdit && (
                  <button onClick={() => router.push(`/expenses/${expense.id}/edit`)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => setShowDeleteConfirm(expense)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
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
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Expense?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove <span className="font-semibold text-foreground">{showDeleteConfirm.title}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-accent">Cancel</button>
                <button onClick={() => handleDelete(showDeleteConfirm)} disabled={isDeleting} className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-70">
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
