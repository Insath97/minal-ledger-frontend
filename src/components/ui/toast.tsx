"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { CheckCircle2, XCircle, X, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success", duration = 4000) => {
    const id = String(Date.now()) + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast Container - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col-reverse gap-3 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const borderMap: Record<ToastType, string> = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
};

const bgMap: Record<ToastType, string> = {
  success: "bg-emerald-50",
  error: "bg-red-50",
  warning: "bg-amber-50",
  info: "bg-blue-50",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 border-l-4 ${borderMap[toast.type]} ${bgMap[toast.type]} px-4 py-3.5 shadow-lg shadow-black/5 animate-in slide-in-from-right-5 fade-in duration-300 min-w-[320px] max-w-[420px]`}
    >
      <div className="mt-0.5 shrink-0">{iconMap[toast.type]}</div>
      <p className="flex-1 text-sm font-medium text-slate-800 leading-snug">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-md p-1 text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
