"use client";

import { Progress } from "@/components/ui/progress";

interface PasswordStrengthProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  value: number;
}

function getPasswordStrength(password: string): StrengthResult {
  if (password.length === 0) {
    return { score: 0, label: "", color: "", value: 0 };
  }

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "text-red-500", value: 20 };
  if (score <= 3) return { score, label: "Fair", color: "text-amber-500", value: 50 };
  if (score <= 4) return { score, label: "Strong", color: "text-emerald-600", value: 80 };
  return { score, label: "Very Strong", color: "text-emerald-600", value: 100 };
}

function getProgressColor(value: number): string {
  if (value <= 20) return "bg-red-500";
  if (value <= 50) return "bg-amber-500";
  if (value <= 80) return "bg-emerald-500";
  return "bg-emerald-600";
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const strength = getPasswordStrength(password);

  if (password.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-bold text-slate-700">Password Strength</span>
        <span className={`text-[13px] font-bold ${strength.color}`}>{strength.label}</span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(strength.value)}`}
          style={{ width: `${strength.value}%` }}
        />
      </div>
    </div>
  );
}
