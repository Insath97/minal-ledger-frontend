"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations";
import { resetPassword } from "@/lib/api/auth";
import { AuthBadge } from "@/components/auth/auth-badge";
import { AuthDivider } from "@/components/auth/auth-divider";
import { SecurityCard } from "@/components/auth/security-card";
import { SuccessState } from "@/components/auth/success-state";
import { PasswordStrength } from "@/components/auth/password-strength";
import { PasswordRules } from "@/components/auth/password-rules";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailFromUrl = searchParams.get("email");
  const { toast } = useToast();

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
    defaultValues: {
      email: emailFromUrl || "",
    },
  });

  const password = watch("password", "");

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast("Invalid reset link. Please request a new one.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, emailFromUrl || data.email, data.password, data.confirmPassword);
      setIsReset(true);
      toast("Password has been reset successfully.", "success");
    } catch (err: unknown) {
      const error = err as Error;
      toast(error.message || "Failed to reset password. The link may have expired.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-8 relative w-fit">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 border border-amber-200/60">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
        </div>

        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">
          Invalid Reset Link
        </h1>
        <p className="mt-3 text-[15px] text-slate-500 leading-relaxed max-w-sm mx-auto">
          This password reset link is invalid or missing. Please request a new one.
        </p>

        <Link
          href="/forgot-password"
          className="group mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all"
        >
          Request New Reset Link
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <div className="mt-6 text-center">
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

  if (isReset) {
    return (
      <SuccessState
        title="Password Reset!"
        subtitle="Your password has been updated successfully. You can now sign in with your new credentials."
      >
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-100/60 p-5 text-left">
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
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all"
        >
          Continue to Sign In
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </SuccessState>
    );
  }

  return (
    <div>
      <AuthBadge label="SECURITY" />

      <div className="mb-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200/60">
          <ShieldCheck className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-[1.15]">
          Create New Password
        </h1>
        <p className="mt-2.5 text-[15px] text-slate-500 leading-relaxed">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-slate-700 uppercase tracking-wide">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            readOnly
            value={emailFromUrl || ""}
            className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 cursor-not-allowed placeholder:text-slate-400"
          />
        </div>

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

        {password.length > 0 && (
          <>
            <PasswordStrength password={password} />

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <PasswordRules password={password} />
            </div>
          </>
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

      <AuthDivider text="SECURITY TIPS" />

      <SecurityCard
        title="Stay Protected"
        description="Use a unique password with a mix of letters, numbers, and symbols. Never share your password with anyone."
        icon={ShieldCheck}
      />

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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
