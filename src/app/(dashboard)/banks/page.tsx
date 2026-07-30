"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getBanks, createBank, updateBank, deleteBank, toggleBankStatus } from "@/lib/api/banks";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import type { Bank } from "@/lib/api/banks";
import type { PaginatedResponse } from "@/types";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

export default function BanksPage() {
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canCreate = hasPermission("Bank Create");
  const canEdit = hasPermission("Bank Update");
  const canDelete = hasPermission("Bank Delete");
  const canToggleStatus = hasPermission("Bank Toggle Status");
  const showActions = canEdit || canDelete;
  const [banks, setBanks] = useState<Bank[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Bank> | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Bank | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (statusFilter === "active") params.is_active = true;
      if (statusFilter === "inactive") params.is_active = false;
      const res = await getBanks(params);
      if (res.status === "success") {
        setBanks(res.data.data);
        setPagination(res.data);
      }
    } catch {
      toast("Failed to load banks", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, statusFilter, toast]);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  const openCreate = () => {
    setEditingBank(null);
    setFormData({ name: "", code: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (bank: Bank) => {
    setEditingBank(bank);
    setFormData({ name: bank.name, code: bank.code, description: bank.description || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.code.trim()) return;
    setIsSaving(true);
    try {
      if (editingBank) {
        await updateBank(editingBank.id, formData);
        toast("Bank updated successfully", "success");
      } else {
        await createBank(formData);
        toast("Bank created successfully", "success");
      }
      setShowModal(false);
      fetchBanks();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to save bank", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (bank: Bank) => {
    setIsDeleting(true);
    try {
      await deleteBank(bank.id);
      toast("Bank deleted successfully", "success");
      setShowDeleteConfirm(null);
      fetchBanks();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to delete bank", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (bank: Bank) => {
    try {
      await toggleBankStatus(bank.id);
      toast(`Bank ${bank.is_active ? "deactivated" : "activated"}`, "success");
      fetchBanks();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to toggle status", "error");
    }
  };

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  const totalPages = pagination?.last_page ?? 1;
  const totalItems = pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banks</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage banks and financial institutions.</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus className="mr-2 h-4 w-4" />
            Add Bank
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search banks by name, code..."
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
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1); }}
            className="h-10 min-w-[140px] rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-all hover:border-border focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Bank</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Code</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</th>
                {canToggleStatus && (
                  <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                )}
                {showActions && (
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={canToggleStatus ? (showActions ? 6 : 5) : (showActions ? 5 : 4)} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Loading banks...</p>
                  </td>
                </tr>
              ) : banks.length === 0 ? (
                <tr>
                  <td colSpan={canToggleStatus ? (showActions ? 6 : 5) : (showActions ? 5 : 4)} className="px-5 py-16 text-center">
                    <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-semibold text-foreground">No banks found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                banks.map((bank, i) => (
                  <tr key={bank.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-600">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">{bank.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="border-border bg-muted text-foreground text-[10px] font-bold">
                        {bank.code}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="max-w-xs truncate text-sm text-muted-foreground">{bank.description || "—"}</p>
                    </td>
                    {canToggleStatus && (
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(bank)}
                          className="inline-flex items-center gap-1.5 cursor-pointer"
                          title={`Click to ${bank.is_active ? "deactivate" : "activate"}`}
                        >
                          <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              bank.is_active ? "bg-emerald-500" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-card shadow-sm transition-transform ${
                                bank.is_active ? "translate-x-[18px]" : "translate-x-[3px]"
                              }`}
                            />
                          </span>
                          <span className={`text-xs font-medium ${bank.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {bank.is_active ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                    )}
                    {showActions && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              onClick={() => openEdit(bank)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setShowDeleteConfirm(bank)}
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
            itemLabel="banks"
          />
        )}
      </div>

      {/* Mobile Cards */}
      {loading ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading banks...</p>
        </div>
      ) : banks.length === 0 ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-foreground">No banks found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {banks.map((bank) => (
            <div key={bank.id} className="rounded-2xl border border-border bg-background p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Building2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{bank.name}</p>
                    <Badge variant="outline" className="border-border bg-muted text-foreground text-[10px] font-bold">{bank.code}</Badge>
                  </div>
                </div>
                {canToggleStatus && (
                  <button
                    onClick={() => handleToggleStatus(bank)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${bank.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                  >
                    {bank.is_active ? "Active" : "Inactive"}
                  </button>
                )}
              </div>

              {bank.description && (
                <p className="text-xs text-muted-foreground mb-3 truncate">{bank.description}</p>
              )}

              <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                {canEdit && (
                  <button
                    onClick={() => openEdit(bank)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(bank)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
              <div className="p-4 sm:p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">{editingBank ? "Edit Bank" : "Create Bank"}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Brac Bank"
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Code *</label>
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. BRAC"
                      className="h-10 uppercase"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all hover:border-border focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formData.name.trim() || !formData.code.trim()}
                  className="flex-1 h-10 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : editingBank ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
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
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Bank?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove <span className="font-semibold text-foreground">{showDeleteConfirm.name}</span>. This action cannot be undone.
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
