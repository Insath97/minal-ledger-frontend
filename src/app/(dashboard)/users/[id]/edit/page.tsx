"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Save,
  ChevronDown,
  ChevronRight as BreadcrumbSep,
  Search,
  X,
  CheckCircle2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUser, updateUser } from "@/lib/api/users";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { getRoleList } from "@/lib/api/roles";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import type { RoleList } from "@/types";

const userEditSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  username: z.string().min(1, "Username is required").max(100),
  email: z.string().email("Invalid email").max(255).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  confirm_password: z.string().optional().or(z.literal("")),
  role: z.string().optional().or(z.literal("")),
}).refine((data) => {
  if (data.password && data.password.length > 0) {
    return data.confirm_password === data.password;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

type UserEditInput = z.infer<typeof userEditSchema>;

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [roles, setRoles] = useState<RoleList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [canLogin, setCanLogin] = useState(true);
  const [roleSearch, setRoleSearch] = useState("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<UserEditInput>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      role: "",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, rolesRes] = await Promise.all([
          getUser(userId),
          getRoleList(),
        ]);
        if (userRes.status === "success") {
          const u = userRes.data;
          setIsActive(u.is_active);
          setCanLogin(u.can_login);
          reset({
            name: u.name,
            username: u.username,
            email: u.email || "",
            phone: u.phone || "",
            password: "",
            confirm_password: "",
            role: u.roles?.[0]?.name || "",
          });
        }
        if (rolesRes.status === "success") setRoles(rolesRes.data);
      } catch {
        toast("Failed to load user data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, reset, toast]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(roleSearch.toLowerCase()));

  const setRole = (roleName: string) => {
    setValue("role", selectedRole === roleName ? "" : roleName, { shouldValidate: true });
    setRoleSearch("");
    setRoleDropdownOpen(false);
  };

  const onSubmit = async (data: UserEditInput) => {
    setIsSaving(true);
    try {
      await updateUser(userId, {
        name: data.name,
        username: data.username,
        email: data.email || undefined,
        phone: data.phone || undefined,
        password: data.password || undefined,
        roles: data.role ? [data.role] : [],
        is_active: isActive,
        can_login: canLogin,
      });
      toast("User updated successfully", "success");
      router.push("/users");
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-2xl bg-muted h-64 animate-pulse" />
        <div className="rounded-2xl bg-muted h-40 animate-pulse" />
      </div>
    );
  }

  if (!hasPermission("User Update")) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-500/10 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
        <p className="text-sm text-muted-foreground">You don&apos;t have permission to edit users.</p>
        <button onClick={() => router.push("/users")} className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit User</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Update user information and roles.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/users")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">Users</button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">Edit</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Basic Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Name *</label>
              <Input {...register("name")} placeholder="e.g. John Doe" className="h-11" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Username *</label>
              <Input {...register("username")} placeholder="e.g. johndoe" className="h-11" />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Email</label>
              <Input {...register("email")} type="email" placeholder="e.g. john@example.com" className="h-11" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Phone</label>
              <Input {...register("phone")} placeholder="e.g. +1234567890" className="h-11" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Password</label>
              <Input {...register("password")} type="password" placeholder="Leave blank to keep current" className="h-11" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Change Password</h2>
          <p className="mb-4 text-xs text-muted-foreground">Leave blank to keep current password.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Password</label>
              <Input {...register("password")} type="password" placeholder="Min 6 characters" className="h-11" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Confirm Password</label>
              <Input {...register("confirm_password")} type="password" placeholder="Re-enter password" className="h-11" />
              {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>}
            </div>
          </div>
        </div>

        {/* Status Toggles - Compact Inline */}
        <div className="rounded-2xl border border-border bg-card px-6 py-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold text-foreground">Active</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? "bg-emerald-500" : "bg-muted"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-card shadow-sm transition-transform ${isActive ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
              </button>
            </div>
            <div className="h-5 w-px bg-muted" />
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold text-foreground">Can Login</span>
              <button
                type="button"
                onClick={() => setCanLogin(!canLogin)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${canLogin ? "bg-emerald-500" : "bg-muted"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-card shadow-sm transition-transform ${canLogin ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Role Select - Single */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Role</h2>
          <div className="relative" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-card px-4 text-sm transition-all hover:border-border focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {selectedRole ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                  {selectedRole}
                  <span role="button" onClick={(e) => { e.stopPropagation(); setRole(""); }} className="cursor-pointer">
                    <X className="h-3 w-3" />
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">Select a role...</span>
              )}
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {roleDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      placeholder="Search roles..."
                      className="h-9 w-full rounded-lg border border-border bg-muted pl-8 pr-3 text-xs text-foreground outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border-t border-border scrollbar-thin">
                  {filteredRoles.length === 0 ? (
                    <p className="py-4 text-center text-xs text-muted-foreground">No roles found</p>
                  ) : (
                    filteredRoles.map((role) => {
                      const isSelected = selectedRole === role.name;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setRole(role.name)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted"
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isSelected ? "border-emerald-500 bg-emerald-500" : "border-border bg-card"
                          }`}>
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-card" />}
                          </div>
                          <span className={`text-sm ${isSelected ? "text-emerald-600 font-medium" : "text-foreground"}`}>{role.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/users")} className="h-11 px-6 border-border text-foreground font-semibold">
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Update User
          </Button>
        </div>
      </form>
    </div>
  );
}
