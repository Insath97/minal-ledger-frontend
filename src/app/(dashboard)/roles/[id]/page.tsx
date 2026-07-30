"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Shield,
  Edit,
  Trash2,
  ChevronRight as BreadcrumbSep,
  Users,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getRole, deleteRole } from "@/lib/api/roles";
import { useToast } from "@/components/ui/toast";
import type { Role } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

const GROUP_COLORS: Record<string, string> = {
  "Dashboard": "bg-blue-500",
  "Transactions": "bg-emerald-500",
  "Invoices": "bg-violet-500",
  "Analytics": "bg-amber-500",
  "Wallet": "bg-cyan-500",
  "Subscriptions": "bg-pink-500",
  "Recurring": "bg-indigo-500",
  "Settings": "bg-muted0",
  "Roles": "bg-orange-500",
  "Users": "bg-teal-500",
};

function getGroupColor(group: string) {
  return GROUP_COLORS[group] || "bg-emerald-500";
}

export default function ViewRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const canEdit = hasPermission("Role Update");
  const canDelete = hasPermission("Role Delete");
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await getRole(roleId);
        if (res.status === "success") setRole(res.data);
      } catch {
        toast("Failed to load role", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [roleId, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteRole(roleId);
      toast("Role deleted successfully", "success");
      router.push("/roles");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to delete role", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-2xl bg-muted h-32 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-semibold text-foreground">Role not found</p>
        <Button onClick={() => router.push("/roles")} className="mt-4" variant="outline">
          Back to Roles
        </Button>
      </div>
    );
  }

  const groupedPermissions = role.permissions.reduce<Record<string, typeof role.permissions>>((acc, p) => {
    if (!acc[p.group_name]) acc[p.group_name] = [];
    acc[p.group_name].push(p);
    return acc;
  }, {});

  const initials = role.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Role Details</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">View role information and assigned permissions.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/roles")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">
            Roles
          </button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">{role.name}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 shrink-0">
              <span className="text-xl sm:text-2xl font-bold text-white">{initials}</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{role.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                  <Shield className="mr-1 h-3 w-3" />
                  {role.guard_name}
                </Badge>
                {role.is_protected ? (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-semibold">
                    <Lock className="mr-1 h-3 w-3" />
                    Protected
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-semibold">
                    <Unlock className="mr-1 h-3 w-3" />
                    Editable
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            {!role.is_protected && (
              <>
                {canEdit && (
                <Button
                  onClick={() => router.push(`/roles/${role.id}/edit`)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-md shadow-emerald-600/20"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                )}
                {canDelete && (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="border-red-500/20 text-red-600 hover:bg-red-500/10 font-semibold"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{role.permissions.length}</p>
              <p className="text-xs text-muted-foreground">Total Permissions</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{Object.keys(groupedPermissions).length}</p>
              <p className="text-xs text-muted-foreground">Permission Groups</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${role.is_protected ? "bg-amber-500/10" : "bg-blue-500/10"}`}>
              {role.is_protected ? <Lock className="h-5 w-5 text-amber-600" /> : <Unlock className="h-5 w-5 text-blue-600" />}
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{role.is_protected ? "Yes" : "No"}</p>
              <p className="text-xs text-muted-foreground">Protected Role</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions by Group */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Assigned Permissions</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {role.permissions.length} permissions across {Object.keys(groupedPermissions).length} groups
          </p>
        </div>
        <div className="divide-y divide-border">
          {Object.entries(groupedPermissions).map(([group, perms]) => (
            <div key={group} className="px-4 sm:px-6 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-2.5 w-2.5 rounded-full ${getGroupColor(group)}`} />
                <span className="text-sm font-semibold text-foreground">{group}</span>
                <Badge variant="outline" className="border-border bg-muted text-foreground text-[10px] font-bold">
                  {perms.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-5">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center gap-2 rounded-lg bg-emerald-500/10/70 border border-emerald-500/20 px-3 py-2"
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-500">
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium text-emerald-600">{perm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {role.permissions.length === 0 && (
            <div className="px-4 sm:px-6 py-12 text-center">
              <Shield className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No permissions assigned to this role</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-card shadow-2xl border border-border overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-4 sm:p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Delete Role?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove <span className="font-semibold text-foreground">{role.name}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-4 sm:px-6 pb-4 sm:pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
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
