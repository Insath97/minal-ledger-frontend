"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  User,
  Edit,
  Trash2,
  ChevronRight as BreadcrumbSep,
  Shield,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUser, deleteUser } from "@/lib/api/users";
import { useToast } from "@/components/ui/toast";
import type { User as UserType } from "@/lib/api/users";

const ROLE_COLORS = [
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-violet-100 text-violet-700 border-violet-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
];

function getRoleColor(index: number) {
  return ROLE_COLORS[index % ROLE_COLORS.length];
}

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const { toast } = useToast();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser(userId);
        if (res.status === "success") setUser(res.data);
      } catch {
        toast("Failed to load user", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, toast]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser(userId);
      toast("User deleted successfully", "success");
      router.push("/users");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast(error.message || "Failed to delete user", "error");
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
        <div className="rounded-2xl bg-slate-100 h-36 animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-600">User not found</p>
        <Button onClick={() => router.push("/users")} className="mt-4" variant="outline">
          Back to Users
        </Button>
      </div>
    );
  }

  const initials = user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Details</h1>
          <p className="mt-0.5 text-sm text-slate-500">View user information and settings.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/users")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            Users
          </button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">{user.name}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-lg shadow-emerald-600/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <div className="mt-1 flex items-center gap-3">
                <Badge variant="outline" className="border-emerald-200 bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  @{user.username}
                </Badge>
                {user.is_active ? (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-semibold">
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </Badge>
                )}
                {user.can_login ? (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold">
                    <Unlock className="mr-1 h-3 w-3" />
                    Can Login
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs font-semibold">
                    <Lock className="mr-1 h-3 w-3" />
                    No Login
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push(`/users/${user.id}/edit`)}
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
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{user.roles?.length ?? 0}</p>
              <p className="text-xs text-slate-500">Assigned Roles</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "Never"}
              </p>
              <p className="text-xs text-slate-500">Last Login</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100">
              <Calendar className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-500">Created</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
              <User className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user.user_type}</p>
              <p className="text-xs text-slate-500">User Type</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Contact Information</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Mail className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email</p>
              <p className="text-sm text-slate-700">{user.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Phone className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
              <p className="text-sm text-slate-700">{user.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <ImageIcon className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Profile Image</p>
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.name} className="h-10 w-10 rounded-lg object-cover mt-1" />
              ) : (
                <p className="text-sm text-slate-700">No image uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Roles */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Assigned Roles</h2>
          <p className="text-xs text-slate-500 mt-1">
            {user.roles?.length ?? 0} roles assigned to this user
          </p>
        </div>
        <div className="px-6 py-4">
          {user.roles && user.roles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role, i) => (
                <Badge
                  key={role.id}
                  variant="outline"
                  className={`${getRoleColor(i)} text-sm font-semibold px-3 py-1.5`}
                >
                  <Shield className="mr-1.5 h-3.5 w-3.5" />
                  {role.name}
                </Badge>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Shield className="mx-auto h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">No roles assigned to this user</p>
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
                <h3 className="text-lg font-bold text-slate-900 mb-1">Delete User?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  This will permanently remove <span className="font-semibold text-slate-700">{user.name}</span>. This action cannot be undone.
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
