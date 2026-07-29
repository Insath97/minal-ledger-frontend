"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  ChevronDown,
  ChevronRight as BreadcrumbSep,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser } from "@/lib/api/users";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { getRoleList } from "@/lib/api/roles";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import type { RoleList } from "@/types";

const userSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  username: z.string().min(1, "Username is required").max(100),
  email: z.string().email("Invalid email").max(255),
  phone: z.string().max(20).optional().or(z.literal("")),
  role: z.string().optional().or(z.literal("")),
});

type UserInput = z.infer<typeof userSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [roles, setRoles] = useState<RoleList[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [roleSearch, setRoleSearch] = useState("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<UserInput>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      role: "",
    },
  });

  const selectedRole = watch("role");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRoleList();
        if (res.status === "success") setRoles(res.data);
      } catch {
        toast("Failed to load roles", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, [toast]);

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

  const onSubmit = async (data: UserInput) => {
    setIsSaving(true);
    try {
      await createUser({
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone || undefined,
        roles: data.role ? [data.role] : [],
      });
      toast("User created successfully", "success");
      router.push("/users");
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to create user");
    } finally {
      setIsSaving(false);
    }
  };

  if (!hasPermission("User Create")) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">You don&apos;t have permission to create users.</p>
        <button onClick={() => router.push("/users")} className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create User</h1>
          <p className="mt-0.5 text-sm text-slate-500">Add a new user to the system.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/users")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Users</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Create</span>
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
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Email *</label>
              <Input {...register("email")} type="email" placeholder="e.g. john@example.com" className="h-11" />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Phone</label>
              <Input {...register("phone")} placeholder="e.g. +1234567890" className="h-11" />
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
            <p className="text-[13px] text-emerald-700 leading-relaxed">
              A strong password will be <strong>auto-generated</strong> and sent to the user&apos;s email address. You don&apos;t need to set one manually.
            </p>
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
                  <span role="button" onClick={(e) => { e.stopPropagation(); setRole(""); }} className="cursor-pointer">
                    <X className="h-3 w-3" />
                  </span>
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
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
}
