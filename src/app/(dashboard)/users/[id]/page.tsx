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
import { useAuthStore } from "@/stores/auth-store";

const ROLE_COLORS = [
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "bg-violet-500/10 text-violet-600 border-violet-500/20",
  "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-cyan-500/10 text-cyan-600 border-cyan-200",
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
  const { hasPermission, isSuperAdmin } = useAuthStore();
  const canEdit = hasPermission("User Update");
  const canDelete = hasPermission("User Delete");
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isUserSuperAdmin = user?.roles?.some((r) => r.name === "Super Admin");
  const currentUserIsSuperAdmin = isSuperAdmin();

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
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-2xl bg-muted h-36 animate-pulse" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <User className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-semibold text-foreground">User not found</p>
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Details</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">View user information and settings.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/users")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">
            Users
          </button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">{user.name}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-lg shadow-emerald-600/20 shrink-0"
              />
            ) : (
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 shrink-0">
                <span className="text-xl sm:text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{user.name}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
                  @{user.username}
                </Badge>
                {user.is_active ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-semibold">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-xs font-semibold">
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactive
                  </Badge>
                )}
                {user.can_login ? (
                  <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-semibold">
                    <Unlock className="mr-1 h-3 w-3" />
                    Can Login
                  </Badge>
                ) : (
                  <Badge className="bg-muted text-foreground border-border text-xs font-semibold">
                    <Lock className="mr-1 h-3 w-3" />
                    No Login
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            {canEdit && !(isUserSuperAdmin && !currentUserIsSuperAdmin) && (
            <Button
              onClick={() => router.push(`/users/${user.id}/edit`)}
              className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-md shadow-emerald-600/20"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            )}
            {canDelete && !(isUserSuperAdmin && !currentUserIsSuperAdmin) && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="border-red-500/20 text-red-600 hover:bg-red-500/10 font-semibold"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{user.roles?.length ?? 0}</p>
              <p className="text-xs text-muted-foreground">Assigned Roles</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : "Never"}
              </p>
              <p className="text-xs text-muted-foreground">Last Login</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
              <Calendar className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
              <User className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{user.user_type}</p>
              <p className="text-xs text-muted-foreground">User Type</p>
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="text-sm text-foreground truncate">{user.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone</p>
              <p className="text-sm text-foreground">{user.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Profile Image</p>
              {user.profile_image ? (
                <img src={user.profile_image} alt={user.name} className="h-10 w-10 rounded-lg object-cover mt-1" />
              ) : (
                <p className="text-sm text-foreground">No image uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Roles */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Assigned Roles</h2>
          <p className="text-xs text-muted-foreground mt-1">
            {user.roles?.length ?? 0} roles assigned to this user
          </p>
        </div>
        <div className="px-4 sm:px-6 py-4">
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
              <Shield className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No roles assigned to this user</p>
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
                <h3 className="text-lg font-bold text-foreground mb-1">Delete User?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will permanently remove <span className="font-semibold text-foreground">{user.name}</span>. This action cannot be undone.
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
