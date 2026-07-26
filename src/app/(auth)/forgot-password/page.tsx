"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Send, CheckCircle2, Mail, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSent(true);
  };

  if (isSent) {
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
          Check Your Email
        </h1>
        <p className="mt-3 text-[15px] text-slate-500 leading-relaxed max-w-sm mx-auto">
          We&apos;ve sent a password reset link. It may take a minute to arrive.
        </p>

        {/* Email Preview */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
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

        <div className="mt-8 space-y-3">
          <Button
            onClick={() => setIsSent(false)}
            className="group h-12 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-semibold shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Send className="mr-2 h-4 w-4" />
            Resend Email
          </Button>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 border border-emerald-200/60">
          <Mail className="h-7 w-7 text-emerald-600" />
        </div>
        <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-[1.15]">
          Forgot Password?
        </h1>
        <p className="mt-2.5 text-[15px] text-slate-500 leading-relaxed">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {/* Form */}
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

      {/* Help */}
      <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-100 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200">
            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-700">Didn&apos;t receive the email?</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Check your spam folder or contact your administrator for assistance.
            </p>
          </div>
        </div>
      </div>

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
