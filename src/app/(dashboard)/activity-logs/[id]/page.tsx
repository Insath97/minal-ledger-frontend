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
  CREATE: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  UPDATE: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  DELETE: "bg-red-500/10 text-red-600 border-red-500/20",
  TOGGLE_STATUS: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  TOGGLE_CAN_LOGIN: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  LOGIN: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  LOGOUT: "bg-muted text-muted-foreground border-border",
};

function getActionColor(action: string) {
  return ACTION_COLORS[action] || "bg-muted text-muted-foreground border-border";
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
          <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
          <div className="h-7 w-40 rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-2xl bg-muted h-36 animate-pulse" />
        <div className="rounded-2xl bg-muted h-48 animate-pulse" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Activity className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-semibold text-foreground">Activity log not found</p>
        <Button onClick={() => router.push("/activity-logs")} className="mt-4" variant="outline">
          Back to Activity Logs
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log Details</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">View activity log information.</p>
        </div>
        <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs shrink-0">
          <button onClick={() => router.push("/activity-logs")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">Activity Logs</button>
          <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-emerald-600">#{log.id}</span>
        </nav>
      </div>

      {/* Hero Card */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20 shrink-0">
              <Activity className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">Log #{log.id}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={`${getActionColor(log.action)} text-xs font-semibold`}>
                  {log.action}
                </Badge>
                <Badge variant="outline" className="border-border bg-card text-foreground text-xs font-semibold">
                  {log.module}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push("/activity-logs")}
            variant="outline"
            className="border-border text-foreground font-semibold sm:shrink-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="border-b border-border px-4 sm:px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Log Information</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">User</p>
              <p className="text-sm text-foreground truncate">{log.user?.name || "System"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
              <Code className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Description</p>
              <p className="text-sm text-foreground break-words">{log.description || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date & Time</p>
              <p className="text-sm text-foreground">
                {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">IP Address</p>
              <p className="text-sm text-foreground">{log.ip_address || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted shrink-0">
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Method & URL</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-border bg-muted text-foreground text-[10px] font-bold shrink-0">
                  {log.method}
                </Badge>
                <p className="text-sm text-foreground break-all">{log.url || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payload */}
      {log.payload && Object.keys(log.payload).length > 0 && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Payload Data</h2>
          </div>
          <div className="px-4 sm:px-6 py-4">
            <pre className="overflow-x-auto rounded-xl bg-muted border border-border p-4 text-xs text-foreground scrollbar-thin">
              {JSON.stringify(log.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* User Agent */}
      {log.user_agent && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="border-b border-border px-4 sm:px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">User Agent</h2>
          </div>
          <div className="px-4 sm:px-6 py-4">
            <p className="text-xs text-muted-foreground break-all">{log.user_agent}</p>
          </div>
        </div>
      )}
    </div>
  );
}
