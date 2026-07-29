"use client";

import { Check } from "lucide-react";

interface PasswordRulesProps {
  password: string;
}

interface Rule {
  check: boolean;
  label: string;
}

function getRules(password: string): Rule[] {
  return [
    { check: password.length >= 6, label: "At least 6 characters" },
    { check: /[A-Z]/.test(password), label: "One uppercase letter" },
    { check: /[0-9]/.test(password), label: "One number" },
    { check: /[^A-Za-z0-9]/.test(password), label: "One special character" },
  ];
}

export function PasswordRules({ password }: PasswordRulesProps) {
  const rules = getRules(password);

  if (password.length === 0) return null;

  return (
    <div className="space-y-2.5">
      {rules.map((rule) => (
        <div key={rule.label} className="flex items-center gap-3">
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
              rule.check ? "bg-emerald-500 scale-110" : "bg-slate-200"
            }`}
          >
            {rule.check && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </div>
          <span
            className={`text-[13px] transition-colors duration-300 ${
              rule.check ? "text-emerald-600 font-semibold" : "text-slate-500"
            }`}
          >
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}
