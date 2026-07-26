"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getUsers, deleteUser, toggleUserStatus, toggleCanLogin } from "@/lib/api/users";
import { useToast } from "@/components/ui/toast";
import type { User } from "@/lib/api/users";
import type { PaginatedResponse } from "@/types";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<User> | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (statusFilter === "active") params.is_active = true;
      if (statusFilter === "inactive") params.is_active = false;
      const res = await getUsers(params);
      if (res.status === "success") {
        setUsers(res.data.data);
        setPagination(res.data);
      }
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, statusFilter, toast]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (user: User) => {
    setIsDeleting(true);
    try {
      await deleteUser(user.id);
      toast("User deleted successfully", "success");
      setShowDeleteConfirm(null);
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to delete user", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleUserStatus(user.id);
      toast(`User ${user.is_active ? "deactivated" : "activated"}`, "success");
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to toggle status", "error");
    }
  };

  const handleToggleCanLogin = async (user: User) => {
    try {
      await toggleCanLogin(user.id);
      toast(`User ${user.can_login ? "login disabled" : "login enabled"}`, "success");
      fetchUsers();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to toggle login access", "error");
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
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage system users and their access.</p>
        </div>
        <Button onClick={() => router.push("/users/create")} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search users by name, email, username..."
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
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setCurrentPage(1); }}
            className="h-10 min-w-[140px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition-all hover:border-slate-300 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Contact</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Roles</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Login</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
                    <p className="text-sm text-slate-500">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-600">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-400">
                        {(currentPage - 1) * perPage + i + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-400">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-600">{user.email || "—"}</p>
                        <p className="text-xs text-slate-400">{user.phone || ""}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <Badge key={role.id} variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                              {role.name}
                            </Badge>
                          ))}
                          {(!user.roles || user.roles.length === 0) && (
                            <span className="text-xs text-slate-400">No role</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="inline-flex items-center gap-1.5 cursor-pointer"
                          title={`Click to ${user.is_active ? "deactivate" : "activate"}`}
                        >
                          <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              user.is_active ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                                user.is_active ? "translate-x-[18px]" : "translate-x-[3px]"
                              }`}
                            />
                          </span>
                          <span className={`text-xs font-medium ${user.is_active ? "text-emerald-600" : "text-slate-400"}`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleCanLogin(user)}
                          className="inline-flex items-center gap-1.5 cursor-pointer"
                          title={`Click to ${user.can_login ? "disable" : "enable"} login`}
                        >
                          <span
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              user.can_login ? "bg-emerald-500" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                                user.can_login ? "translate-x-[18px]" : "translate-x-[3px]"
                              }`}
                            />
                          </span>
                          <span className={`text-xs font-medium ${user.can_login ? "text-emerald-600" : "text-slate-400"}`}>
                            {user.can_login ? "Yes" : "No"}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/users/${user.id}`)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/users/${user.id}/edit`)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(user)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
                <span className="font-semibold text-slate-700">{totalItems}</span> users
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
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete User?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This will permanently remove <span className="font-semibold text-slate-700">{showDeleteConfirm.name}</span>. This action cannot be undone.
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
