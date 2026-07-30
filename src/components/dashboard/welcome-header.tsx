"use client";

import { useState } from "react";
import { Calendar, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

interface WelcomeHeaderProps {
  onExport?: () => Promise<void>;
}

export function WelcomeHeader({ onExport }: WelcomeHeaderProps) {
  const { user } = useAuthStore();
  const [isExporting, setIsExporting] = useState(false);
  const name = user?.name || "User";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleExport = async () => {
    if (!onExport) return;
    setIsExporting(true);
    try {
      await onExport();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {getGreeting()}, {name}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back! Monitor and control what happens with your money today for financial health.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4 text-slate-400" />
          {today}
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </div>
    </div>
  );
}
