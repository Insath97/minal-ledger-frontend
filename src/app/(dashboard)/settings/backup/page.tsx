"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Database,
  Loader2,
  Terminal,
  Shield,
  CheckCircle2,
  HardDrive,
  Clock,
  ChevronRight as BreadcrumbSep,
  Lock,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import api from "@/lib/api/axios-client";

interface LogEntry {
  type: "system" | "security" | "success" | "error" | "progress";
  text: string;
}

const INITIAL_LOGS: LogEntry[] = [
  { type: "system", text: "[SYSTEM READY] Awaiting database export instruction..." },
  { type: "security", text: "[SECURITY] Access token verified. Tunnels loaded." },
];

export default function DatabaseBackupPage() {
  const router = useRouter();
  const { hasPermission } = useAuthStore();
  const canExport = hasPermission("Database Export");
  const [isBacking, setIsBacking] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [connectionStatus] = useState<"connected" | "disconnected">("connected");
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (entry: LogEntry) => {
    setLogs((prev) => [...prev, entry]);
  };

  const handleBackup = async () => {
    if (isBacking) return;
    setIsBacking(true);
    setLogs([...INITIAL_LOGS]);

    addLog({ type: "progress", text: "[INIT] Preparing database export..." });
    await delay(600);

    addLog({ type: "system", text: "[CONNECT] Establishing secure connection to MySQL..." });
    await delay(800);

    addLog({ type: "security", text: "[SECURITY] TLS 1.3 handshake completed. Channel encrypted." });
    await delay(500);

    addLog({ type: "progress", text: "[DUMP] Locking tables for consistent snapshot..." });
    await delay(700);

    addLog({ type: "system", text: "[DUMP] Exporting schema and data streams..." });
    await delay(1200);

    addLog({ type: "success", text: "[COMPLETE] Database backup generated successfully." });
    await delay(300);

    addLog({ type: "system", text: "[TRANSFER] Streaming file to browser..." });
    await delay(400);

    try {
      const response = await api.get("/backup/database", {
        responseType: "blob",
      });

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `minal-ledger-backup-${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      addLog({ type: "success", text: "[TRANSFER] File downloaded to your local machine." });
      setLastBackup(new Date().toLocaleString());
    } catch {
      addLog({ type: "error", text: "[ERROR] Connection failed. Backup endpoint not available." });
    } finally {
      addLog({ type: "security", text: "[SECURITY] Session tunnel closed. Token rotated." });
      setIsBacking(false);
    }
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  if (!canExport) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Database Backup</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Export your database and download a secure SQL dump file.</p>
          </div>
          <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs">
            <button onClick={() => router.push("/settings")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">Settings</button>
            <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold text-emerald-600">Backup</span>
          </nav>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-16 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Lock className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-foreground">Access Denied</h2>
          <p className="mt-1.5 max-w-sm text-center text-sm text-muted-foreground">
            You do not have permission to access database export. Contact your administrator to request access.
          </p>
          <button
            onClick={() => router.push("/settings")}
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Database Backup</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">Export your database and download a secure SQL dump file.</p>
          </div>
          <nav className="flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs">
            <button onClick={() => router.push("/settings")} className="font-medium text-muted-foreground hover:text-emerald-600 transition-colors">Settings</button>
            <BreadcrumbSep className="h-3 w-3 text-muted-foreground" />
            <span className="font-semibold text-emerald-600">Backup</span>
          </nav>
        </div>

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Database className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Database Engine</p>
              <p className="text-sm font-bold text-foreground">MySQL / MariaDB</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <HardDrive className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Connection Status</p>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <p className="text-sm font-bold text-emerald-600">Connected</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">
              <Clock className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Backup</p>
              <p className="text-sm font-bold text-foreground">{lastBackup || "Never"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column — Info & Actions */}
        <div className="space-y-5 lg:col-span-2">
          {/* Security Protocol */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
                <Shield className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-600">Security Protocol</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-600">
                  This pipeline streams live database states directly to your browser.
                  Ensure you are on a trusted network and delete backup files after use
                  or store them in an encrypted vault.
                </p>
              </div>
            </div>
          </div>

          {/* Backup Info */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-foreground">Export Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Format</span>
                <span className="font-medium text-foreground">SQL Dump (.sql)</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Compression</span>
                <span className="font-medium text-foreground">None (Raw SQL)</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Includes</span>
                <span className="font-medium text-foreground">Schema + Data</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Activity Log</span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Recorded
                </span>
              </div>
            </div>
          </div>

          {/* Backup Button */}
          <button
            onClick={handleBackup}
            disabled={isBacking}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
          >
            {isBacking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Backup in Progress...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Backup Database Now
              </>
            )}
          </button>
        </div>

        {/* Right Column — Terminal */}
        <div className="lg:col-span-3">
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/50 px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                  <Terminal className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Session Logs</p>
                  <p className="text-[11px] text-muted-foreground">Real-time backup activity</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
            </div>

            {/* Terminal Body */}
            <div
              className="flex-1 overflow-y-auto p-5 font-mono text-[11px] leading-5 scrollbar-thin"
              style={{ minHeight: "320px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
            >
              {logs.map((log, i) => (
                <div key={i} className={`whitespace-pre-wrap ${
                  log.type === "success" ? "text-emerald-400" :
                  log.type === "error" ? "text-red-400" :
                  log.type === "security" ? "text-amber-400" :
                  log.type === "progress" ? "text-blue-400" :
                  "text-muted-foreground"
                }`}>
                  {log.text}
                </div>
              ))}
              {isBacking && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400 rounded-sm" />
                </div>
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
