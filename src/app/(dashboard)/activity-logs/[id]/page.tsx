"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Loader2,
  Activity,
  ChevronRight as BreadcrumbSep,
  User,
  Calendar,
  Globe,
  Monitor,
  ArrowLeft,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActivityLog } from "@/lib/api/activity-logs";
import { useToast } from "@/components/ui/toast";
import type { ActivityLog } from "@/lib/api/activity-logs";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  UPDATE: "bg-blue-100 text-blue-700 border-blue-200",
  DELETE: "bg-red-100 text-red-700 border-red-200",
  TOGGLE_STATUS: "bg-amber-100 text-amber-700 border-amber-200",
  TOGGLE_CAN_LOGIN: "bg-violet-100 text-violet-700 border-violet-200",
  LOGIN: "bg-cyan-100 text-cyan-700 border-cyan-200",
  LOGOUT: "bg-slate-100 text-slate-600 border-slate-200",
};

function getActionColor(action: string) {
  return ACTION_COLORS[action] || "bg-slate-100 text-slate-600 border-slate-200";
}

export default function ViewActivityLogPage() {
  const router = useRouter();
  const params = useParams();
  const logId = Number(params.id);
  const { toast } = useToast();
  const [log, setLog] = useState<ActivityLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await getActivityLog(logId);
        if (res.status === "success") setLog(res.data);
      } catch {
        toast("Failed to load activity log", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [logId, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-7 w-40 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="rounded-2xl bg-slate-100 h-36 animate-pulse" />
        <div className="rounded-2xl bg-slate-100 h-48 animate-pulse" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Activity className="h-12 w-12 text-slate-300 mb-3" />
        <p className="text-sm font-semibold text-slate-600">Activity log not found</p>
        <Button onClick={() => router.push("/activity-logs")} className="mt-4" variant="outline">
          Back to Activity Logs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activity Log Details</h1>
          <p className="mt-0.5 text-sm text-slate-500">View activity log information.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs">
          <button onClick={() => router.push("/activity-logs")} className="font-medium text-slate-500 hover:text-emerald-600 transition-colors">Activity Logs</button>
          <BreadcrumbSep className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-emerald-600">#{log.id}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Log #{log.id}</h2>
              <div className="mt-1 flex items-center gap-3">
                <Badge variant="outline" className={`${getActionColor(log.action)} text-xs font-semibold`}>
                  {log.action}
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-white text-slate-600 text-xs font-semibold">
                  {log.module}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push("/activity-logs")}
            variant="outline"
            className="border-slate-200 text-slate-600 font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Log Information</h2>
        </div>
        <div className="divide-y divide-slate-100">
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <User className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">User</p>
              <p className="text-sm text-slate-700">{log.user?.name || "System"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Code className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</p>
              <p className="text-sm text-slate-700">{log.description || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Calendar className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date & Time</p>
              <p className="text-sm text-slate-700">
                {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Globe className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">IP Address</p>
              <p className="text-sm text-slate-700">{log.ip_address || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-6 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
              <Monitor className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Method & URL</p>
              <p className="text-sm text-slate-700">
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold mr-2">
                  {log.method}
                </Badge>
                {log.url || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payload */}
      {log.payload && Object.keys(log.payload).length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Payload Data</h2>
          </div>
          <div className="px-6 py-4">
            <pre className="overflow-x-auto rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-700 scrollbar-thin">
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* User Agent */}
      {log.user_agent && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">User Agent</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-slate-500 break-all">{log.user_agent}</p>
          </div>
        </div>
      )}
    </div>
  );
}
