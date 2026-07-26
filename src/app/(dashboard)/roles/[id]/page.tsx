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

const GROUP_COLORS: Record<string, string> = {
  "Dashboard": "bg-blue-500",
  "Transactions": "bg-emerald-500",
  "Invoices": "bg-violet-500",
  "Analytics": "bg-amber-500",
  "Wallet": "bg-cyan-500",
  "Subscriptions": "bg-pink-500",
  "Recurring": "bg-indigo-500",
  "Settings": "bg-slate-500",
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
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-7 w-40 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-2xl bg-slate-100 h-32 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Role not found</p>
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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Role Details</h1>
          <p className="mt-0.5 text-sm text-slate-500">View role information and assigned permissions.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/roles")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            Roles
          </button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">{role.name}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <span className="text-2xl font-bold text-white">{initials}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{role.name}</h2>
              <div className="mt-1 flex items-center gap-3">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  <Shield className="mr-1 h-3 w-3" />
                  {role.guard_name}
                </Badge>
                {role.is_protected ? (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs font-semibold">
                    <Lock className="mr-1 h-3 w-3" />
                    Protected
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">
                    <Unlock className="mr-1 h-3 w-3" />
                    Editable
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!role.is_protected && (
              <>
                <Button
                  onClick={() => router.push(`/roles/${role.id}/edit`)}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-md shadow-emerald-600/20"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{role.permissions.length}</p>
              <p className="text-xs text-slate-500">Total Permissions</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
              <Users className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{Object.keys(groupedPermissions).length}</p>
              <p className="text-xs text-slate-500">Permission Groups</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${role.is_protected ? "bg-amber-100" : "bg-blue-100"}`}>
              {role.is_protected ? <Lock className="h-5 w-5 text-amber-600" /> : <Unlock className="h-5 w-5 text-blue-600" />}
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{role.is_protected ? "Yes" : "No"}</p>
              <p className="text-xs text-slate-500">Protected Role</p>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions by Group */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Assigned Permissions</h2>
          <p className="text-xs text-slate-500 mt-1">
            {role.permissions.length} permissions across {Object.keys(groupedPermissions).length} groups
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          {Object.entries(groupedPermissions).map(([group, perms]) => (
            <div key={group} className="px-6 py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-2.5 w-2.5 rounded-full ${getGroupColor(group)}`} />
                <span className="text-sm font-semibold text-slate-800">{group}</span>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold">
                  {perms.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pl-5">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="flex items-center gap-2 rounded-lg bg-emerald-50/70 border border-emerald-100 px-3 py-2"
                  >
                    <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-500">
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <span className="text-[13px] font-medium text-emerald-800">{perm.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {role.permissions.length === 0 && (
            <div className="px-6 py-12 text-center">
              <Shield className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">No permissions assigned to this role</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 border border-red-100">
                  <Trash2 className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete Role?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This will permanently remove <span className="font-semibold text-slate-700">{role.name}</span>. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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
