"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Eye,
  ChevronRight,
  X,
  Loader2,
  Activity,
  Calendar,
  ChevronDown,
  User,
} from "lucide-react";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getActivityLogs, getActivityLogModules, getActivityLogActions } from "@/lib/api/activity-logs";
import { useToast } from "@/components/ui/toast";
import type { ActivityLog } from "@/lib/api/activity-logs";
import type { PaginatedResponse } from "@/types";

const PER_PAGE_OPTIONS = [5, 10, 25, 50, 100];

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  TOGGLE_STATUS: "bg-amber-100 text-amber-700 border-amber-200",
  TOGGLE_CAN_LOGIN: "bg-violet-100 text-violet-700 border-violet-200",
  LOGIN: "bg-cyan-100 text-cyan-700 border-cyan-200",
  LOGOUT: "bg-slate-100 text-slate-600 border-slate-200",
};

const LEVEL_COLORS: Record<string, string> = {
  info: "bg-blue-50 text-blue-600",
  warning: "bg-amber-50 text-amber-600",
  error: "bg-red-50 text-red-600",
  success: "bg-emerald-50 text-emerald-600",
};

function getActionColor(action: string) {
  return ACTION_COLORS[action] || "bg-slate-100 text-slate-600 border-slate-200";
}

function getLevelColor(level: string) {
  return LEVEL_COLORS[level] || "bg-slate-50 text-slate-600";
}

export default function ActivityLogsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<ActivityLog> | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [moduleFilter, setModuleFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [moduleSearch, setModuleSearch] = useState("");
  const [actionSearch, setActionSearch] = useState("");
  const [levelSearch, setLevelSearch] = useState("");
  const [moduleDropdownOpen, setModuleDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const moduleDropdownRef = useRef<HTMLDivElement>(null);
  const actionDropdownRef = useRef<HTMLDivElement>(null);
  const levelDropdownRef = useRef<HTMLDivElement>(null);

  const LEVEL_OPTIONS = ["info", "warning", "error", "success"];

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: currentPage, per_page: perPage };
      if (search) params.search = search;
      if (moduleFilter) params.module = moduleFilter;
      if (actionFilter) params.action = actionFilter;
      if (levelFilter) params.level = levelFilter;
      const res = await getActivityLogs(params);
      if (res.status === "success") {
        setLogs(res.data.data);
        setPagination(res.data);
      }
    } catch {
      toast("Failed to load activity logs", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, search, moduleFilter, actionFilter, levelFilter, toast]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [modRes, actRes] = await Promise.all([
          getActivityLogModules(),
          getActivityLogActions(),
        ]);
        if (modRes.status === "success") setModules(modRes.data);
        if (actRes.status === "success") setActions(actRes.data);
      } catch {
        // silent
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moduleDropdownRef.current && !moduleDropdownRef.current.contains(e.target as Node)) {
        setModuleDropdownOpen(false);
      }
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(e.target as Node)) {
        setActionDropdownOpen(false);
      }
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(e.target as Node)) {
        setLevelDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePerPageChange = (value: number) => {
    setPerPage(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("");
    setActionFilter("");
    setLevelFilter("");
    setCurrentPage(1);
  };

  const hasFilters = search || moduleFilter || actionFilter || levelFilter;

  const totalPages = pagination?.last_page ?? 1;
  const totalItems = pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Logs</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track all system actions and changes.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/settings")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Settings</button>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">Activity Logs</span>
        </nav>
      </div>

      {/* Search & Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="h-10 pl-9 pr-9 text-sm"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Module Searchable Select */}
          <div className="relative w-full sm:w-auto" ref={moduleDropdownRef}>
            <button
              type="button"
              onClick={() => setModuleDropdownOpen(!moduleDropdownOpen)}
              className="flex h-10 w-full sm:min-w-[180px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm transition-all hover:border-slate-300 focus:border-emerald-500"
            >
              <span className={moduleFilter ? "text-slate-700 font-medium" : "text-slate-400"}>
                {moduleFilter || "Module"}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${moduleDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {moduleDropdownOpen && (
              <div className="absolute z-50 mt-1 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5">
                  <input
                    autoFocus
                    value={moduleSearch}
                    onChange={(e) => setModuleSearch(e.target.value)}
                    placeholder="Search..."
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => { setModuleFilter(""); setModuleDropdownOpen(false); setModuleSearch(""); setCurrentPage(1); }}
                    className="flex w-full items-center px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    All Modules
                  </button>
                  {modules.filter((m) => m.toLowerCase().includes(moduleSearch.toLowerCase())).map((mod) => (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => { setModuleFilter(mod); setModuleDropdownOpen(false); setModuleSearch(""); setCurrentPage(1); }}
                      className={`flex w-full items-center px-3 py-1.5 text-xs hover:bg-slate-50 ${moduleFilter === mod ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Searchable Select */}
          <div className="relative w-full sm:w-auto" ref={actionDropdownRef}>
            <button
              type="button"
              onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
              className="flex h-10 w-full sm:min-w-[180px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm transition-all hover:border-slate-300 focus:border-emerald-500"
            >
              <span className={actionFilter ? "text-slate-700 font-medium" : "text-slate-400"}>
                {actionFilter || "Action"}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${actionDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {actionDropdownOpen && (
              <div className="absolute z-50 mt-1 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5">
                  <input
                    autoFocus
                    value={actionSearch}
                    onChange={(e) => setActionSearch(e.target.value)}
                    placeholder="Search..."
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => { setActionFilter(""); setActionDropdownOpen(false); setActionSearch(""); setCurrentPage(1); }}
                    className="flex w-full items-center px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    All Actions
                  </button>
                  {actions.filter((a) => a.toLowerCase().includes(actionSearch.toLowerCase())).map((act) => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => { setActionFilter(act); setActionDropdownOpen(false); setActionSearch(""); setCurrentPage(1); }}
                      className={`flex w-full items-center px-3 py-1.5 text-xs hover:bg-slate-50 ${actionFilter === act ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Level Searchable Select */}
          <div className="relative w-full sm:w-auto" ref={levelDropdownRef}>
            <button
              type="button"
              onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
              className="flex h-10 w-full sm:min-w-[160px] items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm transition-all hover:border-slate-300 focus:border-emerald-500"
            >
              <span className={levelFilter ? "text-slate-700 font-medium" : "text-slate-400"}>
                {levelFilter ? levelFilter.charAt(0).toUpperCase() + levelFilter.slice(1) : "Level"}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${levelDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {levelDropdownOpen && (
              <div className="absolute z-50 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                <div className="p-1.5">
                  <input
                    autoFocus
                    value={levelSearch}
                    onChange={(e) => setLevelSearch(e.target.value)}
                    placeholder="Search..."
                    className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border-t border-slate-100 scrollbar-thin">
                  <button
                    type="button"
                    onClick={() => { setLevelFilter(""); setLevelDropdownOpen(false); setLevelSearch(""); setCurrentPage(1); }}
                    className="flex w-full items-center px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                  >
                    All Levels
                  </button>
                  {LEVEL_OPTIONS.filter((l) => l.toLowerCase().includes(levelSearch.toLowerCase())).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => { setLevelFilter(lvl); setLevelDropdownOpen(false); setLevelSearch(""); setCurrentPage(1); }}
                      className={`flex w-full items-center px-3 py-1.5 text-xs hover:bg-slate-50 capitalize ${levelFilter === lvl ? "bg-emerald-50 text-emerald-700 font-medium" : "text-slate-600"}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {hasFilters && (
            <button onClick={clearFilters} className="h-10 px-4 rounded-lg bg-red-50 text-xs font-medium text-red-500 hover:bg-red-100 transition-colors whitespace-nowrap">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Data Table - Desktop */}
      <div className="hidden md:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">#</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Action</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Module</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Description</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
                    <p className="text-sm text-slate-500">Loading activity logs...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Activity className="mx-auto h-10 w-10 text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-600">No activity logs found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-400">
                      {(currentPage - 1) * perPage + i + 1}
                    </td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700">{log.user?.name || "System"}</p>
                        <p className="text-[11px] text-slate-400">{log.user?.username || "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="outline" className={`${getActionColor(log.action)} text-[10px] font-bold`}>
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-medium text-slate-700">{log.module}</span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="max-w-xs truncate text-sm text-slate-500">{log.description || "—"}</p>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.created_at).toLocaleDateString()}
                        <span className="text-slate-400">
                          {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => router.push(`/activity-logs/${log.id}`)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
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
            itemLabel="logs"
          />
        )}
      </div>

      {/* Mobile Cards */}
      {loading ? (
        <div className="md:hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
          <Loader2 className="mx-auto h-8 w-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading activity logs...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="md:hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center">
          <Activity className="mx-auto h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600">No activity logs found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="md:hidden space-y-3">
          {logs.map((log) => (
            <button
              key={log.id}
              onClick={() => router.push(`/activity-logs/${log.id}`)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 shrink-0">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{log.user?.name || "System"}</p>
                    <p className="text-[11px] text-slate-400">{log.user?.username || "—"}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`${getActionColor(log.action)} text-[10px] font-bold shrink-0`}>
                  {log.action}
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded-full px-2 py-0.5">{log.module}</span>
                {log.description && (
                  <p className="text-xs text-slate-500 truncate min-w-0">{log.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <Calendar className="h-3 w-3" />
                {new Date(log.created_at).toLocaleDateString()}
                {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
