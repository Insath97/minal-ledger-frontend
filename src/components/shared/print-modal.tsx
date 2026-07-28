"use client";

import { useState } from "react";
import { Printer, Download, X, Loader2, FileText } from "lucide-react";

interface PrintModalProps {
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
  title?: string;
  downloading?: boolean;
}

export function PrintModal({ open, onClose, onPrint, onDownloadPdf, title = "Report", downloading }: PrintModalProps) {
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
          <p className="mt-1 text-sm text-slate-500">Choose how you want to export this report</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onPrint}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
          >
            <Printer className="h-4 w-4" />
            Print Preview
          </button>
          <button
            onClick={onDownloadPdf}
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
                <Download className="h-4 w-4" />
                Download as PDF (A4)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
