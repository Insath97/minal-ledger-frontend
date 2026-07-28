"use client";

import { X, Loader2, FileText } from "lucide-react";

interface PrintModalProps {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  title?: string;
  downloading?: boolean;
}

export function PrintModal({ open, onClose, onPrint, title = "Report", downloading }: PrintModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button onClick={onClose} className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <FileText className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Print {title}</h3>
          <p className="mt-1 text-sm text-slate-500">Download this report as a PDF file</p>
        </div>

        <button
          onClick={onPrint}
          disabled={downloading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4" />
              Download PDF
            </>
          )}
        </button>
      </div>
    </div>
  );
}
