"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Loader2,
  Shield,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ChevronRight as BreadcrumbSep,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRole, updateRole } from "@/lib/api/roles";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { getPermissionList } from "@/lib/api/permissions";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import type { Permission } from "@/types";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(255),
  permissionIds: z.array(z.number()).min(1, "At least one permission is required"),
});

type RoleInput = z.infer<typeof roleSchema>;

export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = Number(params.id);
  const { toast } = useToast();
  const { hasPermission } = useAuthStore();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [permSearch, setPermSearch] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", permissionIds: [] },
  });

  const selectedPermissionIds = watch("permissionIds");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roleRes, permsRes] = await Promise.all([
          getRole(roleId),
          getPermissionList(),
        ]);
        if (roleRes.status === "success") {
          reset({
            name: roleRes.data.name,
            permissionIds: roleRes.data.permissions.map((p) => p.id),
          });
        }
        if (permsRes.status === "success") {
          setPermissions(permsRes.data);
          const groups: Record<string, boolean> = {};
          permsRes.data.forEach((p) => { groups[p.group_name] = true; });
          setExpandedGroups(groups);
        }
      } catch {
        toast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roleId, reset, toast]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    permissions.forEach((p) => {
      if (!groups[p.group_name]) groups[p.group_name] = [];
      groups[p.group_name].push(p);
    });
    return groups;
  }, [permissions]);

  const filteredGroupedPermissions = useMemo(() => {
    if (!permSearch) return groupedPermissions;
    const q = permSearch.toLowerCase();
    const filtered: Record<string, Permission[]> = {};
    Object.entries(groupedPermissions).forEach(([group, perms]) => {
      const matched = perms.filter((p) => p.name.toLowerCase().includes(q) || group.toLowerCase().includes(q));
      if (matched.length > 0) filtered[group] = matched;
    });
    return filtered;
  }, [groupedPermissions, permSearch]);

  const allPermissionIds = permissions.map((p) => p.id);
  const allSelected = allPermissionIds.every((id) => selectedPermissionIds.includes(id));
  const someSelected = allPermissionIds.some((id) => selectedPermissionIds.includes(id)) && !allSelected;

  const toggleGlobalSelectAll = () => {
    if (allSelected) {
      setValue("permissionIds", []);
    } else {
      setValue("permissionIds", [...allPermissionIds]);
    }
  };

  const toggleGroupSelectAll = (group: string) => {
    const groupIds = groupedPermissions[group].map((p) => p.id);
    const allGroupSelected = groupIds.every((id) => selectedPermissionIds.includes(id));
    if (allGroupSelected) {
      setValue("permissionIds", selectedPermissionIds.filter((id) => !groupIds.includes(id)));
    } else {
      const newIds = [...new Set([...selectedPermissionIds, ...groupIds])];
      setValue("permissionIds", newIds);
    }
  };

  const togglePermission = (id: number) => {
    if (selectedPermissionIds.includes(id)) {
      setValue("permissionIds", selectedPermissionIds.filter((pid) => pid !== id));
    } else {
      setValue("permissionIds", [...selectedPermissionIds, id]);
    }
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const onSubmit = async (data: RoleInput) => {
    setIsSaving(true);
    try {
      await updateRole(roleId, { name: data.name, permissions: data.permissionIds });
      toast("Role updated successfully", "success");
      router.push("/roles");
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to update role");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
          <div>
            <div className="h-7 w-32 rounded bg-slate-100 animate-pulse mb-2" />
            <div className="h-4 w-48 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-50 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission("Role Update")) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-red-100 p-4">
          <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Denied</h2>
        <p className="text-sm text-slate-500">You don&apos;t have permission to edit roles.</p>
        <button onClick={() => router.push("/roles")} className="mt-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          Back to Roles
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Role</h1>
          <p className="mt-0.5 text-sm text-slate-500">Update role details and permissions.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/roles")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            Roles
          </button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <button onClick={() => router.push(`/roles/${roleId}`)} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            {watch("name") || "Details"}
          </button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Edit</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Name */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Role Details</h2>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Name *</label>
            <Input
              {...register("name")}
              placeholder="e.g. Admin"
              className="h-11"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>
        </div>

        {/* Permissions */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Permissions *</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedPermissionIds.length} of {permissions.length} selected</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Search permissions..."
                    className="h-9 w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-xs text-slate-600 outline-none focus:border-emerald-500"
                  />
                  {permSearch && (
                    <button onClick={() => setPermSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={toggleGlobalSelectAll}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    allSelected
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : someSelected
                        ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className={`flex h-4 w-4 items-center justify-center rounded border-2 transition-colors ${
                    allSelected ? "border-emerald-500 bg-emerald-500" : someSelected ? "border-emerald-500 bg-emerald-100" : "border-slate-300 bg-white"
                  }`}>
                    {(allSelected || someSelected) && (
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  Select All
                </button>
              </div>
            </div>
            {errors.permissionIds && (
              <p className="mt-2 text-xs text-red-500">{errors.permissionIds.message}</p>
            )}
          </div>

          <div className="max-h-[480px] overflow-y-auto scrollbar-thin border-t border-slate-100">
            {Object.entries(filteredGroupedPermissions).length === 0 && permSearch && (
              <p className="py-8 text-center text-sm text-slate-400">No permissions match &quot;{permSearch}&quot;</p>
            )}
            {Object.entries(filteredGroupedPermissions).map(([group, perms]) => {
              const groupIds = perms.map((p) => p.id);
              const allGroupSelected = groupIds.every((id) => selectedPermissionIds.includes(id));
              const someGroupSelected = groupIds.some((id) => selectedPermissionIds.includes(id)) && !allGroupSelected;
              const isExpanded = expandedGroups[group] ?? true;

              return (
                  <div key={group} className="border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-3 bg-slate-50/80 px-6 py-3">
                      <button
                        type="button"
                        onClick={() => toggleGroup(group)}
                        className="flex flex-1 items-center gap-2 text-left"
                      >
                        <span className="text-sm font-semibold text-slate-700">{group}</span>
                        <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">{perms.length}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleGroupSelectAll(group)}
                        className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                          allGroupSelected
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : someGroupSelected
                              ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                              : "border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <div className={`flex h-3.5 w-3.5 items-center justify-center rounded border-[1.5px] transition-colors ${
                          allGroupSelected ? "border-emerald-500 bg-emerald-500" : someGroupSelected ? "border-emerald-500 bg-emerald-100" : "border-slate-300 bg-white"
                        }`}>
                          {(allGroupSelected || someGroupSelected) && (
                            <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                        Select
                      </button>
                      <button type="button" onClick={() => toggleGroup(group)}>
                        {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                      </button>
                    </div>
                  {isExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-100">
                      {perms.map((perm) => {
                        const isSelected = selectedPermissionIds.includes(perm.id);
                        return (
                          <button
                            key={perm.id}
                            type="button"
                            onClick={() => togglePermission(perm.id)}
                            className={`flex items-center gap-2.5 bg-white px-6 py-2.5 text-left transition-colors hover:bg-emerald-50/50 ${isSelected ? "bg-emerald-50/70" : ""}`}
                          >
                            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                              isSelected ? "border-emerald-500 bg-emerald-500" : "border-slate-300 bg-white"
                            }`}>
                              {isSelected && (
                                <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </div>
                            <span className={`text-[13px] ${isSelected ? "text-emerald-700 font-medium" : "text-slate-600"}`}>
                              {perm.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/roles")}
            className="h-11 px-6 border-slate-200 text-slate-600 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="h-11 px-8 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-600/20"
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
            Update Role
          </Button>
        </div>
      </form>
    </div>
  );
}
