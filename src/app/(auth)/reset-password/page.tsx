"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("password", "");

  const getPasswordStrength = (pw: string) => {
    if (pw.length === 0) return { score: 0, label: "", color: "", textColor: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { score, label: "Weak", color: "bg-red-500", textColor: "text-red-500" };
    if (score <= 3) return { score, label: "Fair", color: "bg-amber-500", textColor: "text-amber-500" };
    if (score <= 4) return { score, label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-600" };
    return { score, label: "Very Strong", color: "bg-emerald-600", textColor: "text-emerald-600" };
  };

  const strength = getPasswordStrength(password);

  const rules = [
    { check: password.length >= 6, label: "At least 6 characters" },
    { check: /[A-Z]/.test(password), label: "One uppercase letter" },
    { check: /[0-9]/.test(password), label: "One number" },
    { check: /[^A-Za-z0-9]/.test(password), label: "One special character" },
  ];

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsReset(true);
  };

  if (isReset) {
    return (
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-8 relative w-fit">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 border border-emerald-200/60">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-[3px] border-white">
            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Password Reset!
        </h1>
        <p className="mt-3 text-[15px] text-slate-500 leading-relaxed max-w-sm mx-auto">
          Your password has been updated. You can now sign in with your new credentials.
        </p>

        {/* Security Note */}
        <div className="mt-8 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/60 p-5 text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 border border-emerald-200/50">
              <ShieldCheck className="h-[18px] w-[18px] text-emerald-600" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">Security Tip</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Use a unique password that you don&apos;t use for other accounts.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="group mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all"
        >
          Continue to Sign In
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200/60">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-[1.15]">
          Create New Password
        </h1>
        <p className="mt-2.5 text-[15px] text-slate-500 leading-relaxed">
          Choose a strong password to secure your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            New Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-12 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-red-500" />
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm new password"
              className="h-12 rounded-xl border-slate-200 bg-white px-4 pr-12 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-red-500" />
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Password Strength */}
        {password.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-bold text-slate-700">Password Strength</span>
              <span className={`text-[13px] font-bold ${strength.textColor}`}>{strength.label}</span>
            </div>
            <div className="flex gap-1.5 mb-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= strength.score ? strength.color : "bg-slate-100"
                  }`}
                />
              ))}
            </div>

            <div className="space-y-2.5">
              {rules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-3">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
                    rule.check ? "bg-emerald-500 scale-110" : "bg-slate-200"
                  }`}>
                    {rule.check && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[13px] transition-colors duration-300 ${rule.check ? "text-emerald-600 font-semibold" : "text-slate-500"}`}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="group relative h-12 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-lg shadow-emerald-600/25 transition-all overflow-hidden"
          disabled={isLoading}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </span>
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
