"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { createRole } from "@/lib/api/roles";
import { handleServerErrors } from "@/lib/api/handle-server-errors";
import { getPermissionList } from "@/lib/api/permissions";
import { useToast } from "@/components/ui/toast";
import type { Permission } from "@/types";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required").max(255),
  permissionIds: z.array(z.number()).min(1, "At least one permission is required"),
});

type RoleInput = z.infer<typeof roleSchema>;

export default function CreateRolePage() {
  const router = useRouter();
  const { toast } = useToast();
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
    setError,
    formState: { errors },
  } = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: "", permissionIds: [] },
  });

  const selectedPermissionIds = watch("permissionIds");

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const res = await getPermissionList();
        if (res.status === "success") {
          setPermissions(res.data);
          const groups: Record<string, boolean> = {};
          res.data.forEach((p) => { groups[p.group_name] = true; });
          setExpandedGroups(groups);
        }
      } catch {
        toast("Failed to load permissions", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPerms();
  }, [toast]);

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

  const filteredPermissionIds = useMemo(() => {
    return Object.values(filteredGroupedPermissions).flat().map((p) => p.id);
  }, [filteredGroupedPermissions]);

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
      await createRole({ name: data.name, permissions: data.permissionIds });
      toast("Role created successfully", "success");
      router.push("/roles");
    } catch (err: unknown) {
      handleServerErrors(err, setError, toast, "Failed to create role");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Role</h1>
          <p className="mt-0.5 text-sm text-slate-500">Add a new role with permission assignments.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/roles")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">
            Roles
          </button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Create</span>
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Name */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
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
          <div className="p-4 sm:p-6 pb-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Permissions *</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedPermissionIds.length} of {permissions.length} selected</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={permSearch}
                    onChange={(e) => setPermSearch(e.target.value)}
                    placeholder="Search permissions..."
                    className="h-9 w-full sm:w-56 rounded-lg border border-slate-200 bg-white pl-8 pr-8 text-xs text-slate-600 outline-none focus:border-emerald-500"
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

          {loading ? (
            <div className="py-8 text-center border-t border-slate-100">
              <Loader2 className="mx-auto h-6 w-6 text-emerald-500 animate-spin mb-2" />
              <p className="text-sm text-slate-500">Loading permissions...</p>
            </div>
          ) : (
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
                    <div className="flex items-center gap-3 bg-slate-50/80 px-4 sm:px-6 py-3">
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
                              className={`flex items-center gap-2.5 bg-white px-4 sm:px-6 py-2.5 text-left transition-colors hover:bg-emerald-50/50 ${isSelected ? "bg-emerald-50/70" : ""}`}
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
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
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
            Create Role
          </Button>
        </div>
      </form>
    </div>
  );
}
