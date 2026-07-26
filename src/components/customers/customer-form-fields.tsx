"use client";

import { X } from "lucide-react";

interface ImageUploadProps {
  label: string;
  preview: string | null;
  icon: React.ReactNode;
  uploadText: string;
  onRemove: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant?: "square" | "rectangular";
}

export function ImageUpload({ label, preview, icon, uploadText, onRemove, onChange, variant = "square" }: ImageUploadProps) {
  const isRect = variant === "rectangular";
  return (
    <div className="space-y-2">
      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">{label}</label>
      {preview ? (
        <div className={`relative ${isRect ? "w-full h-28" : "w-28 h-28"}`}>
          <img src={preview} alt={label} className="w-full h-full object-cover rounded-xl border-2 border-slate-200" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <label className={`flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-colors ${isRect ? "w-full h-28" : "w-28 h-28"}`}>
          {icon}
          <span className="text-xs text-slate-500">{uploadText}</span>
          <input type="file" accept="image/*" onChange={onChange} className="hidden" />
        </label>
      )}
    </div>
  );
}

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

export function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label} {required && "*"}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
