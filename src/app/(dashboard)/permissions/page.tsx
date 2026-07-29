"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getPermissions,
  getPermissionList,
  createPermission,
  updatePermission,
  deletePermission,
} from "@/lib/api/permissions";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import type { Permission, PaginatedResponse } from "@/types";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

export default function PermissionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();

  const canCreate = hasPermission("Permission Create");
  const canEdit = hasPermission("Permission Update");
  const canDelete = hasPermission("Permission Delete");
  const showActions = canEdit || canDelete;
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Permission> | null>(null);
  const [permissionList, setPermissionList] = useState<Permission[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [groupNameFilter, setGroupNameFilter] = useState("");
  const [groupSearch, setGroupSearch] = useState("");
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  const groupNames = [...new Set(permissionList.map((p) => p.group_name))].sort();
  const filteredGroups = groupNames.filter((g) => g.toLowerCase().includes(groupSearch.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(e.target as Node)) {
        setGroupDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Permission | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({ name: "", group_name: "" });

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (groupNameFilter) params.group_name = groupNameFilter;
      const res = await getPermissions(params);
      if (res.status === "success") {
        setPermissions(res.data.data);
        setPagination(res.data);
      }
    } catch {
      toast("Failed to load permissions", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, groupNameFilter, toast]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await getPermissionList();
        if (res.status === "success") setPermissionList(res.data);
      } catch { /* ignore */ }
    };
    fetchList();
  }, []);

  const resetForm = () => {
    setFormData({ name: "", group_name: "" });
    setEditingPermission(null);
  };

  const openCreate = () => { resetForm(); setShowModal(true); };

  const openEdit = (perm: Permission) => {
    setEditingPermission(perm);
    setFormData({ name: perm.name, group_name: perm.group_name });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.group_name.trim()) return;
    setIsSaving(true);
    try {
      if (editingPermission) {
        await updatePermission(editingPermission.id, {
          name: formData.name,
          group_name: formData.group_name,
        });
        toast("Permission updated successfully", "success");
      } else {
        await createPermission({
          name: formData.name,
          group_name: formData.group_name,
        });
        toast("Permission created successfully", "success");
      }
      setShowModal(false);
      resetForm();
      fetchPermissions();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Operation failed", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (perm: Permission) => {
    setIsSaving(true);
    try {
      await deletePermission(perm.id);
      toast("Permission deleted successfully", "success");
      setShowDeleteConfirm(null);
      fetchPermissions();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to delete permission", "error");
    } finally {
      setIsSaving(false);
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Permissions</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage system permissions and access controls.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
            <button onClick={() => router.push("/settings")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Settings</button>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-emerald-600">Permissions</span>
          </nav>
          {canCreate && (
            <Button onClick={openCreate} className="h-11 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
              <Plus className="mr-2 h-4 w-4" />
              Add Permission
            </Button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search permissions by name, group..."
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
          <div className="relative" ref={groupDropdownRef}>
            <button
              onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
              className="flex h-10 min-w-[200px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm transition-all hover:border-slate-300 focus:border-emerald-500"
            >
              <span className={groupNameFilter ? "text-slate-700 font-medium" : "text-slate-400"}>
                {groupNameFilter || "All Groups"}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${groupDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {groupDropdownOpen && (
              <div className="absolute z-50 mt-1 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5">
                  <input
                    autoFocus
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    placeholder="Search..."
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                  <button
                    onClick={() => { setGroupNameFilter(""); setGroupDropdownOpen(false); setGroupSearch(""); setCurrentPage(1); }}
                    className="flex w-full items-center px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    All Groups
                  </button>
                  {filteredGroups.map((g) => (
                    <button
                      key={g}
                      onClick={() => { setGroupNameFilter(g); setGroupDropdownOpen(false); setGroupSearch(""); setCurrentPage(1); }}
                      className={`flex w-full items-center px-3 py-1.5 text-xs hover:bg-slate-50 ${groupNameFilter === g ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}
                    >
                      <span className="truncate">{g}</span>
                    </button>
                  ))}
                  {filteredGroups.length === 0 && (
                    <p className="py-4 text-center text-xs text-slate-400">No groups found</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  #
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Permission Name
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Group
                </th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Guard
                </th>
                {showActions && (
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={showActions ? 5 : 4} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
                    <p className="text-sm text-slate-500">Loading permissions...</p>
                  </td>
                </tr>
              ) : permissions.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 5 : 4} className="px-5 py-16 text-center">
                    <Shield className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-600">No permissions found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                permissions.map((perm, i) => (
                  <tr key={perm.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-slate-400">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-slate-800">{perm.name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 font-medium">
                        {perm.group_name}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                        {perm.guard_name}
                      </code>
                    </td>
                    {showActions && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <button
                              onClick={() => openEdit(perm)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => setShowDeleteConfirm(perm)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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
                <span className="font-semibold text-slate-700">{totalItems}</span> permissions
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowModal(false); resetForm(); }} />
          <div className="relative z-10 w-full max-w-lg mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200/50">
                      <Shield className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {editingPermission ? "Edit Permission" : "Create Permission"}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {editingPermission ? "Update permission details" : "Add a new permission to the system"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Group Name</label>
                    <Input
                      value={formData.group_name}
                      onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                      placeholder="e.g. Dashboard"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Permission Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. View Dashboard"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="flex-1 border-slate-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!formData.name.trim() || !formData.group_name.trim() || isSaving}
                    className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editingPermission ? "Update" : "Create"}
                  </Button>
                </div>
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
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Permission?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This will permanently remove <span className="font-semibold text-slate-700">{showDeleteConfirm.name}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isSaving}
                  className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 shadow-lg shadow-red-500/25 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
