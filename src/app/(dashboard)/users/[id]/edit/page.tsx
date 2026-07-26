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
import { getRoleList } from "@/lib/api/roles";
import { useToast } from "@/components/ui/toast";
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
      const error = err as { message?: string };
      toast(error.message || "Failed to update user", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-7 w-40 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-2xl bg-slate-100 h-64 animate-pulse" />
        <div className="rounded-2xl bg-slate-100 h-40 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit User</h1>
          <p className="mt-0.5 text-sm text-slate-500">Update user information and roles.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/users")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Users</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Edit</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Basic Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Name *</label>
              <Input {...register("name")} placeholder="e.g. John Doe" className="h-11" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Username *</label>
              <Input {...register("username")} placeholder="e.g. johndoe" className="h-11" />
              {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Email</label>
              <Input {...register("email")} type="email" placeholder="e.g. john@example.com" className="h-11" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Phone</label>
              <Input {...register("phone")} placeholder="e.g. +1234567890" className="h-11" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Password</label>
              <Input {...register("password")} type="password" placeholder="Leave blank to keep current" className="h-11" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Change Password</h2>
          <p className="mb-4 text-xs text-slate-500">Leave blank to keep current password.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Password</label>
              <Input {...register("password")} type="password" placeholder="Min 6 characters" className="h-11" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Confirm Password</label>
              <Input {...register("confirm_password")} type="password" placeholder="Re-enter password" className="h-11" />
              {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password.message}</p>}
            </div>
          </div>
        </div>

        {/* Status Toggles - Compact Inline */}
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold text-slate-700">Active</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${isActive ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
              </button>
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold text-slate-700">Can Login</span>
              <button
                type="button"
                onClick={() => setCanLogin(!canLogin)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${canLogin ? "bg-emerald-500" : "bg-slate-200"}`}
              >
                <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${canLogin ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Role Select - Single */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Role</h2>
          <div className="relative" ref={roleDropdownRef}>
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 text-sm transition-all hover:border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            >
              {selectedRole ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {selectedRole}
                  <button type="button" onClick={(e) => { e.stopPropagation(); setRole(""); }}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : (
                <span className="text-slate-400">Select a role...</span>
              )}
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {roleDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      autoFocus
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      placeholder="Search roles..."
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-600 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                  {filteredRoles.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">No roles found</p>
                  ) : (
                    filteredRoles.map((role) => {
                      const isSelected = selectedRole === role.name;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setRole(role.name)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"
                          }`}>
                            {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <span className={`text-sm ${isSelected ? "text-emerald-700 font-medium" : "text-slate-600"}`}>{role.name}</span>
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
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/users")} className="h-11 px-6 border-slate-200 text-slate-600 font-semibold">
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
