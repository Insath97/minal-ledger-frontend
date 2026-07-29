"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Send, Mail, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { forgotPassword } from "@/lib/api/auth";
import { AuthBadge } from "@/components/auth/auth-badge";
import { AuthDivider } from "@/components/auth/auth-divider";
import { SecurityCard } from "@/components/auth/security-card";
import { SuccessState } from "@/components/auth/success-state";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const startCountdown = useCallback(() => {
    setCountdown(30);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setSentEmail(data.email);
      setIsSent(true);
      startCountdown();
      toast("Reset link sent to your email.", "success");
    } catch (err: unknown) {
      const error = err as Error;
      toast(error.message || "Failed to send reset link. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!sentEmail) return;
    setIsLoading(true);
    try {
      await forgotPassword(sentEmail);
      startCountdown();
      toast("Reset link sent again.", "success");
    } catch (err: unknown) {
      const error = err as Error;
      toast(error.message || "Failed to resend reset link.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <SuccessState
        title="Email Sent!"
        subtitle="We've sent a password reset link to your email address. It may take a minute to arrive."
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <Inbox className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Minal Ledger</p>
              <p className="text-xs text-slate-400">no-reply@minaledger.com</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
            <p className="text-sm font-semibold text-slate-800 mb-1">Password Reset Request</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click the button below to reset your password. This link expires in 30 minutes.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
              Reset Password
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </div>
          </div>
        </div>

        <Button
          onClick={handleResend}
          disabled={countdown > 0}
          className="group h-12 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {countdown > 0 ? (
            `Resend in ${countdown}s`
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Resend Email
            </>
          )}
        </Button>

        <Link
          href="/login"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </SuccessState>
    );
  }

  return (
    <div>
      <AuthBadge label="SECURITY" />

      <div className="mb-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200/60">
          <Mail className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-[1.15]">
          Forgot Password?
        </h1>
        <p className="mt-2.5 text-[15px] text-slate-500 leading-relaxed">
          No worries, we&apos;ll send you reset instructions.
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
            placeholder="admin@minaledger.com"
            className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-red-500" />
              {errors.email.message}
            </p>
          )}
        </div>

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
                Sending reset link...
              </>
            ) : (
              <>
                Send Reset Link
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </span>
        </Button>
      </form>

      <AuthDivider text="NEED HELP?" />

      <SecurityCard
        title="Didn't receive the email?"
        description="Check your spam folder or contact your administrator for assistance."
        icon={Inbox}
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
