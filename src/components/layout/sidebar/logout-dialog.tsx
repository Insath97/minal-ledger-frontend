"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { LogOut, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLogging, setIsLogging] = useState(false);

  const handleLogout = async () => {
    setIsLogging(true);
    try {
      await logout();
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="relative z-[10000] w-full max-w-sm mx-4">
        <div className="rounded-3xl bg-white shadow-2xl shadow-black/10 border border-slate-100 overflow-hidden">
          {/* Top Accent */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600" />

          <div className="p-6 text-center">
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100">
              <LogOut className="h-8 w-8 text-emerald-600" />
            </div>

            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1.5">
              Confirm Logout
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Are you sure you want to log out? You&apos;ll need to sign in again to access the dashboard.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={isLogging}
              className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold transition-all hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 disabled:opacity-70"
            >
              {isLogging ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging out...
                </span>
              ) : (
                "Yes, Logout"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
