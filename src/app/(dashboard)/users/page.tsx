"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  X,
  Loader2,
  Users,
  Lock,
} from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getUsers, deleteUser, toggleUserStatus, toggleCanLogin } from "@/lib/api/users";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/lib/api/users";
import type { PaginatedResponse } from "@/types";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission, isSuperAdmin } = useAuthStore();

  const canCreate = hasPermission("User Create");
  const canEdit = hasPermission("User Update");
  const canDelete = hasPermission("User Delete");
  const canToggleStatus = hasPermission("User Toggle Status");
  const showActions = canEdit || canDelete;

  const isUserSuperAdmin = (user: User) => user.roles?.some((r) => r.name === "Super Admin");
  const currentUserIsSuperAdmin = isSuperAdmin();
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
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage system users and their access.</p>
        </div>
        {canCreate && (
          <Button onClick={() => router.push("/users/create")} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-border bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, username..."
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
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Contact</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Roles</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Login</th>
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
                    <p className="text-sm text-muted-foreground">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={showActions ? 7 : 6} className="px-5 py-16 text-center">
                    <Users className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-semibold text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              ) : (
                users.map((user, i) => {
                  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <tr key={user.id} className="hover:bg-accent/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {(currentPage - 1) * perPage + i + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{user.name}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-foreground">{user.email || "—"}</p>
                        <p className="text-xs text-muted-foreground">{user.phone || ""}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((role) => (
                            <Badge key={role.id} variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">
                              {role.name}
                            </Badge>
                          ))}
                          {(!user.roles || user.roles.length === 0) && (
                            <span className="text-xs text-muted-foreground">No role</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {isUserSuperAdmin(user) ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                            <Lock className="h-2.5 w-2.5" /> Protected
                          </span>
                        ) : canToggleStatus ? (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className="inline-flex items-center gap-1.5 cursor-pointer"
                            title={`Click to ${user.is_active ? "deactivate" : "activate"}`}
                          >
                            <span
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                user.is_active ? "bg-emerald-500" : "bg-muted"
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 rounded-full bg-card shadow-sm transition-transform ${
                                  user.is_active ? "translate-x-[18px]" : "translate-x-[3px]"
                                }`}
                              />
                            </span>
                            <span className={`text-xs font-medium ${user.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </button>
                        ) : (
                          <span className={`text-xs font-medium ${user.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {isUserSuperAdmin(user) ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                            <Lock className="h-2.5 w-2.5" /> Protected
                          </span>
                        ) : canToggleStatus ? (
                          <button
                            onClick={() => handleToggleCanLogin(user)}
                            className="inline-flex items-center gap-1.5 cursor-pointer"
                            title={`Click to ${user.can_login ? "disable" : "enable"} login`}
                          >
                            <span
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                user.can_login ? "bg-emerald-500" : "bg-muted"
                              }`}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 rounded-full bg-card shadow-sm transition-transform ${
                                  user.can_login ? "translate-x-[18px]" : "translate-x-[3px]"
                                }`}
                              />
                            </span>
                            <span className={`text-xs font-medium ${user.can_login ? "text-emerald-600" : "text-muted-foreground"}`}>
                              {user.can_login ? "Yes" : "No"}
                            </span>
                          </button>
                        ) : (
                          <span className={`text-xs font-medium ${user.can_login ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {user.can_login ? "Yes" : "No"}
                          </span>
                        )}
                      </td>
                      {showActions && (
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/users/${user.id}`)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {canEdit && !(isUserSuperAdmin(user) && !currentUserIsSuperAdmin) && (
                              <button
                                onClick={() => router.push(`/users/${user.id}/edit`)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {canDelete && !(isUserSuperAdmin(user) && !currentUserIsSuperAdmin) && (
                              <button
                                onClick={() => setShowDeleteConfirm(user)}
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
                  );
                })
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
            itemLabel="users"
          />
        )}
      </div>

      {/* Mobile Cards */}
      {loading ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="md:hidden rounded-2xl border border-border bg-background shadow-sm p-8 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-semibold text-foreground">No users found</p>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {users.map((user) => {
            const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
            return (
              <div key={user.id} className="rounded-2xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isUserSuperAdmin(user) ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                        <Lock className="h-2.5 w-2.5" /> Protected
                      </span>
                    ) : canToggleStatus ? (
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${user.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </button>
                    ) : (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${user.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {user.roles?.map((role) => (
                    <Badge key={role.id} variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold">
                      {role.name}
                    </Badge>
                  ))}
                  {(!user.roles || user.roles.length === 0) && (
                    <span className="text-xs text-muted-foreground">No role</span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-1 pt-2 border-t border-border">
                  <button
                    onClick={() => router.push(`/users/${user.id}`)}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {canEdit && !(isUserSuperAdmin(user) && !currentUserIsSuperAdmin) && (
                    <button
                      onClick={() => router.push(`/users/${user.id}/edit`)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {canDelete && !(isUserSuperAdmin(user) && !currentUserIsSuperAdmin) && (
                    <button
                      onClick={() => setShowDeleteConfirm(user)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
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
                <h3 className="text-lg font-bold text-foreground mb-1">Delete User?</h3>
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
